/**
 * SequentialChainMode.tsx
 *
 * 「一鏡接一鏡」連續生成模式
 *
 * 流程：
 * 1. 按「開始」→ 生成鏡頭 1 首幀 → 生成鏡頭 1 影片 → AI 給下一鏡頭建議
 * 2. 按「接下去」→ 從上一支影片抽最後一幀作為本鏡頭首幀 → 結合建議+故事生成影片 → 再給建議
 * 3. 如此類推
 */

import React, { useState, useCallback, useRef } from 'react';
import { Play, ChevronRight, Loader2, Film, Image as ImageIcon, Sparkles, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Project, Scene, Character } from '../types';
import { apiJson, apiFetch } from '../lib/apiClient';
import { extractLastFrameFromVideo } from '../lib/frameExtractor';
import { ScrubbableVideoPlayer } from './ScrubbableVideoPlayer';

interface SequentialChainModeProps {
  project: Project;
  onUpdateScenes: (scenes: Scene[]) => void;
  artStyle?: string;
  cameraMotion?: string;
}

type ChainPhase =
  | 'idle'
  | 'gen_image'
  | 'gen_video'
  | 'gen_advice'
  | 'waiting_continue'
  | 'extract_frame'
  | 'done'
  | 'error';

interface ChainLog {
  time: string;
  msg: string;
  type?: 'info' | 'ok' | 'warn' | 'err';
}

export const SequentialChainMode: React.FC<SequentialChainModeProps> = ({
  project,
  onUpdateScenes,
  artStyle,
  cameraMotion,
}) => {
  const scenes = project.scenes || [];
  const characters = project.characters || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<ChainPhase>('idle');
  const [logs, setLogs] = useState<ChainLog[]>([]);
  const [lastAdvice, setLastAdvice] = useState('');
  const [extractedFrameUrl, setExtractedFrameUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const abortRef = useRef(false);

  const addLog = useCallback((msg: string, type: ChainLog['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('zh-HK', { hour12: false });
    setLogs((prev) => [...prev.slice(-40), { time, msg, type }]);
  }, []);

  const getCharDesc = (charName: string): string => {
    const c = characters.find(
      (x) => (x.name || '').trim() === (charName || '').trim()
    );
    if (!c) return '';
    const gender =
      c.gender === 'male'
        ? 'male, clearly masculine face and body, man'
        : c.gender === 'female'
          ? 'female, clearly feminine face and body, woman'
          : '';
    return [gender, c.description, c.clothing, c.age ? `age ${c.age}` : '']
      .filter(Boolean)
      .join(', ');
  };

  const updateSceneAt = (index: number, patch: Partial<Scene>) => {
    const next = scenes.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onUpdateScenes(next);
  };

  /** Poll /api/status until video task completes */
  const waitForVideoTask = async (): Promise<string> => {
    const maxWait = 8 * 60 * 1000;
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      if (abortRef.current) throw new Error('已取消');
      const st = await apiJson<any>('/api/status', {}, { timeoutMs: 15000, retries: 1, label: 'Status' });
      if (st?.status === 'completed' && (st.outputPath || st.localPath)) {
        return st.outputPath || st.localPath;
      }
      if (st?.status === 'failed') {
        throw new Error(st.error || '影片生成失敗');
      }
      const progress = st?.progress || '?';
      addLog(`影片生成中… ${progress}`, 'info');
      await new Promise((r) => setTimeout(r, 4000));
    }
    throw new Error('影片生成逾時（超過 8 分鐘）');
  };

  /** Generate start-frame image for a scene */
  const generateImageForScene = async (scene: Scene, index: number): Promise<string> => {
    setPhase('gen_image');
    updateSceneAt(index, { isGeneratingImage: true });
    addLog(`鏡頭 ${index + 1}：正在生成首幀…`, 'info');

    const charDesc = getCharDesc(scene.character);
    const body = {
      prompt: scene.visualPrompt || scene.title || 'cinematic scene',
      negativePrompt: scene.negativePrompt || '',
      artStyle: artStyle || project.artStyle || 'Anime key visual',
      character: scene.character,
      characterDescription: charDesc,
      engine: 'agnes',
      agnesImageMode: project.agnesImageMode || 'quality',
    };

    const data = await apiJson<{ imageUrl?: string; error?: string }>(
      '/api/generate-image',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      { timeoutMs: 180000, retries: 1, label: 'GenerateImage' }
    );

    if (!data?.imageUrl) throw new Error(data?.error || '首幀生成失敗');
    updateSceneAt(index, { imageUrl: data.imageUrl, isGeneratingImage: false });
    addLog(`鏡頭 ${index + 1}：首幀完成 ✓`, 'ok');
    return data.imageUrl;
  };

  /** Generate video for a scene (optionally with start frame / extend from prev video) */
  const generateVideoForScene = async (
    scene: Scene,
    index: number,
    opts: { imageUrl?: string; extendFromVideoUrl?: string; advice?: string }
  ): Promise<string> => {
    setPhase('gen_video');
    updateSceneAt(index, { isGeneratingVideo: true, videoProgress: '1%' });
    addLog(`鏡頭 ${index + 1}：正在生成影片…`, 'info');

    const charDesc = getCharDesc(scene.character);
    let prompt = scene.actionPrompt || scene.visualPrompt || scene.title || 'cinematic motion';
    if (opts.advice) {
      prompt = `${prompt}. Continuity from previous shot: ${opts.advice}`;
    }

    const body: any = {
      prompt,
      visualPrompt: scene.visualPrompt,
      actionPrompt: scene.actionPrompt,
      transitionPrompt: scene.transitionPrompt,
      dialogue: scene.dialogue,
      narration: scene.narration,
      directorNotes: scene.directorNotes,
      character: scene.character,
      characterDescription: charDesc,
      artStyle: artStyle || project.artStyle,
      imageUrl: opts.imageUrl || scene.imageUrl,
      durationSeconds: scene.durationSeconds || 8,
      agnesVideoMode: project.agnesVideoMode || 'quality',
      sceneIndex: index,
      sceneType: 'chain',
    };

    // Prefer extendFromVideoUrl so server extracts last frame itself
    if (opts.extendFromVideoUrl) {
      body.extendFromVideoUrl = opts.extendFromVideoUrl;
      addLog(`鏡頭 ${index + 1}：使用上一支影片尾幀作為本鏡頭首幀（伺服器自動抽取）`, 'info');
    }

    await apiJson(
      '/api/generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      { timeoutMs: 30000, retries: 1, label: 'StartVideo' }
    );

    const videoUrl = await waitForVideoTask();
    updateSceneAt(index, {
      videoUrl,
      isGeneratingVideo: false,
      videoProgress: '100%',
      step6Passed: true,
    });
    addLog(`鏡頭 ${index + 1}：影片完成 ✓`, 'ok');
    return videoUrl;
  };

  /** Ask AI for next-shot continuity advice */
  const generateAdvice = async (current: Scene, next?: Scene): Promise<string> => {
    setPhase('gen_advice');
    addLog('AI 正在撰寫下一鏡頭連續性建議…', 'info');
    try {
      const data = await apiJson<{ advice?: string; summary?: string }>(
        '/api/workflow/generate-step7-advice',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentScene: current, nextScene: next }),
        },
        { timeoutMs: 60000, retries: 1, label: 'Advice' }
      );
      const advice =
        data?.advice ||
        '保持角色服裝、光影方向與空間位置一致，鏡頭運動自然銜接。';
      setLastAdvice(advice);
      if (current.id) {
        const idx = scenes.findIndex((s) => s.id === current.id);
        if (idx >= 0) updateSceneAt(idx, { step7AdviceForNext: advice });
      }
      addLog('下一鏡頭建議已就緒', 'ok');
      return advice;
    } catch (e: any) {
      const fallback = '保持角色服裝與光影一致，動作自然延續。';
      setLastAdvice(fallback);
      addLog(`建議生成略過，使用預設連續性指引`, 'warn');
      return fallback;
    }
  };

  /** START: first shot image + video + advice */
  const handleStart = async () => {
    if (!scenes.length) {
      setErrorMsg('請先在「AI 分鏡劇本」拆解出至少一個鏡頭');
      return;
    }
    abortRef.current = false;
    setErrorMsg('');
    setLogs([]);
    setCurrentIndex(0);
    setExtractedFrameUrl(null);

    try {
      const scene0 = scenes[0];
      addLog('🚀 開始連續生成 — 鏡頭 1', 'info');

      // 1) Image
      let imageUrl = scene0.imageUrl;
      if (!imageUrl) {
        imageUrl = await generateImageForScene(scene0, 0);
      } else {
        addLog('鏡頭 1：已有首幀，跳過繪圖', 'info');
      }

      // 2) Video
      let videoUrl = scene0.videoUrl;
      if (!videoUrl) {
        videoUrl = await generateVideoForScene(scenes[0], 0, { imageUrl });
      } else {
        addLog('鏡頭 1：已有影片，跳過生成', 'info');
      }

      // 3) Advice for shot 2
      const advice = await generateAdvice(scenes[0], scenes[1]);
      setLastAdvice(advice);

      if (scenes.length <= 1) {
        setPhase('done');
        addLog('全部鏡頭完成（只有 1 個鏡頭）', 'ok');
      } else {
        setPhase('waiting_continue');
        addLog('✅ 鏡頭 1 完成。請按「接下去」繼續鏡頭 2', 'ok');
      }
    } catch (e: any) {
      setPhase('error');
      setErrorMsg(e?.message || String(e));
      addLog(`錯誤：${e?.message || e}`, 'err');
      updateSceneAt(0, { isGeneratingImage: false, isGeneratingVideo: false });
    }
  };

  /** CONTINUE: extract last frame → next video → advice */
  const handleContinue = async () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= scenes.length) {
      setPhase('done');
      addLog('所有鏡頭已完成！', 'ok');
      return;
    }

    abortRef.current = false;
    setErrorMsg('');

    try {
      const prev = scenes[currentIndex];
      const curr = scenes[nextIndex];
      if (!prev?.videoUrl) throw new Error('上一鏡頭沒有影片，無法抽取尾幀');

      addLog(`── 接續鏡頭 ${nextIndex + 1} ──`, 'info');

      // A) Extract last frame (client or server)
      setPhase('extract_frame');
      addLog(`從鏡頭 ${currentIndex + 1} 影片抽取最後一幀…`, 'info');
      let startFrame = extractedFrameUrl;
      try {
        startFrame = await extractLastFrameFromVideo(prev.videoUrl);
        setExtractedFrameUrl(startFrame);
        updateSceneAt(nextIndex, { imageUrl: startFrame });
        addLog(`尾幀抽取成功，已設為鏡頭 ${nextIndex + 1} 首幀`, 'ok');
      } catch (ex: any) {
        addLog(`尾幀抽取失敗，改由伺服器 extendFromVideoUrl 處理：${ex?.message}`, 'warn');
        startFrame = undefined as any;
      }

      // B) Generate video for next scene
      const advice = lastAdvice || prev.step7AdviceForNext || '';
      await generateVideoForScene(curr, nextIndex, {
        imageUrl: startFrame || curr.imageUrl,
        extendFromVideoUrl: startFrame ? undefined : prev.videoUrl,
        advice,
      });

      // C) Advice for the following shot
      const nextNext = scenes[nextIndex + 1];
      const newAdvice = await generateAdvice(scenes[nextIndex], nextNext);
      setLastAdvice(newAdvice);

      setCurrentIndex(nextIndex);
      setExtractedFrameUrl(null);

      if (nextIndex + 1 >= scenes.length) {
        setPhase('done');
        addLog('🎉 全部鏡頭連續生成完成！', 'ok');
      } else {
        setPhase('waiting_continue');
        addLog(`✅ 鏡頭 ${nextIndex + 1} 完成。按「接下去」繼續鏡頭 ${nextIndex + 2}`, 'ok');
      }
    } catch (e: any) {
      setPhase('error');
      setErrorMsg(e?.message || String(e));
      addLog(`錯誤：${e?.message || e}`, 'err');
      updateSceneAt(currentIndex + 1, { isGeneratingVideo: false });
    }
  };

  const handleReset = () => {
    abortRef.current = true;
    setPhase('idle');
    setCurrentIndex(0);
    setLastAdvice('');
    setExtractedFrameUrl(null);
    setErrorMsg('');
    setLogs([]);
  };

  const isBusy = ['gen_image', 'gen_video', 'gen_advice', 'extract_frame'].includes(phase);
  const canStart = phase === 'idle' || phase === 'error' || phase === 'done';
  const canContinue = phase === 'waiting_continue' && currentIndex + 1 < scenes.length;

  return (
    <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 to-slate-900/80 p-5">
        <h2 className="text-lg font-bold text-indigo-200 flex items-center gap-2">
          <Film className="w-5 h-5" />
          一鏡接一鏡 · 連續生成模式
        </h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          按「開始」後，AI 會自動生成<strong className="text-indigo-300">第一個鏡頭的首幀 + 影片</strong>，並給出下一鏡頭建議。
          再按「接下去」時，系統會<strong className="text-emerald-300">從上一支影片抽出最後一幀</strong>作為本鏡頭首幀，結合建議與故事內容生成下一支影片，如此類推，確保畫面真正連續。
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 flex-wrap">
        {scenes.map((s, i) => {
          const done = !!(s.videoUrl);
          const active = i === currentIndex && phase !== 'idle' && phase !== 'done';
          return (
            <div
              key={s.id || i}
              className={`px-3 py-1.5 rounded-full text-[11px] font-mono border ${
                done
                  ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-300'
                  : active
                    ? 'bg-indigo-900/50 border-indigo-400 text-indigo-200 animate-pulse'
                    : 'bg-slate-800/50 border-slate-600 text-slate-500'
              }`}
            >
              {done ? '✓' : active ? '●' : '○'} 鏡頭 {i + 1}
            </div>
          );
        })}
        {!scenes.length && (
          <span className="text-xs text-amber-400">尚未有分鏡，請先到「AI 分鏡劇本」拆解故事</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleStart}
          disabled={!canStart || !scenes.length || isBusy}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-900/40 transition"
        >
          {isBusy && phase !== 'waiting_continue' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          {phase === 'idle' || phase === 'error' ? '開始' : phase === 'done' ? '重新開始' : '進行中…'}
        </button>

        <button
          onClick={handleContinue}
          disabled={!canContinue || isBusy}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-emerald-900/40 transition"
        >
          <ChevronRight className="w-4 h-4" />
          接下去（鏡頭 {currentIndex + 2}）
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs border border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-400 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置
        </button>
      </div>

      {/* Advice card */}
      {lastAdvice && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-4">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            下一鏡頭連續性建議
          </div>
          <p className="text-sm text-amber-100/90 leading-relaxed">{lastAdvice}</p>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-200">{errorMsg}</p>
        </div>
      )}

      {/* Current / recent previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenes.slice(0, currentIndex + 1).map((s, i) => (
          <div key={s.id || i} className="rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-700 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">
                鏡頭 {i + 1} · {s.character || '—'}
              </span>
              {s.videoUrl ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : s.isGeneratingVideo || s.isGeneratingImage ? (
                <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              ) : null}
            </div>
            {s.videoUrl ? (
              <div className="aspect-video bg-black">
                <ScrubbableVideoPlayer src={s.videoUrl} className="w-full h-full" />
              </div>
            ) : s.imageUrl ? (
              <div className="aspect-video bg-slate-950 flex items-center justify-center">
                <img src={s.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="aspect-video bg-slate-950 flex items-center justify-center text-slate-600 text-xs">
                <ImageIcon className="w-6 h-6 opacity-40" />
              </div>
            )}
            <div className="px-3 py-2 text-[10px] text-slate-500 truncate">{s.title}</div>
          </div>
        ))}
      </div>

      {/* Logs */}
      <div className="rounded-lg border border-slate-700 bg-slate-950/80 p-3 max-h-48 overflow-y-auto font-mono text-[11px] space-y-1">
        {logs.length === 0 && (
          <div className="text-slate-600">工作日誌會顯示在這裡…</div>
        )}
        {logs.map((l, i) => (
          <div
            key={i}
            className={
              l.type === 'ok'
                ? 'text-emerald-400'
                : l.type === 'err'
                  ? 'text-red-400'
                  : l.type === 'warn'
                    ? 'text-amber-400'
                    : 'text-slate-400'
            }
          >
            <span className="text-slate-600">[{l.time}]</span> {l.msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SequentialChainMode;
