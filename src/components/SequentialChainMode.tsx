/**
 * SequentialChainMode.tsx
 *
 * 「一鏡接一鏡 · 即時自動導演」
 *
 * 核心改變：
 * - 唔需要事先去「AI 分鏡劇本」拆好鏡頭
 * - 按「開始」→ 即時對照 novelText 生成鏡頭1 分鏡 + 首幀 + 影片 + 下一鏡建議
 * - 按「接下去」→ 抽上一支尾幀 + 對照故事進度即時生成下一鏡頭分鏡 + 圖 + 片
 * - 每個鏡頭都係即時產生，進度跟住實際結果走
 */

import React, { useState, useCallback, useRef } from 'react';
import { Play, ChevronRight, Loader2, Film, Image as ImageIcon, Sparkles, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Project, Scene, Character, DEFAULT_SCENE } from '../types';
import { apiJson } from '../lib/apiClient';
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
  | 'gen_scene'
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

function uid() {
  return 'sc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

export const SequentialChainMode: React.FC<SequentialChainModeProps> = ({
  project,
  onUpdateScenes,
  artStyle,
  cameraMotion,
}) => {
  const scenes = project.scenes || [];
  const characters = project.characters || [];
  const novelText = (project.novelText || '').trim();

  const [currentIndex, setCurrentIndex] = useState(Math.max(0, scenes.length - 1));
  const [phase, setPhase] = useState<ChainPhase>('idle');
  const [logs, setLogs] = useState<ChainLog[]>([]);
  const [lastAdvice, setLastAdvice] = useState('');
  const [extractedFrameUrl, setExtractedFrameUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const abortRef = useRef(false);

  const addLog = useCallback((msg: string, type: ChainLog['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('zh-HK', { hour12: false });
    setLogs((prev) => [...prev.slice(-50), { time, msg, type }]);
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

  /** Replace entire scenes array (used when appending new on-the-fly scenes) */
  const setScenes = (next: Scene[]) => {
    onUpdateScenes(next);
  };

  const updateSceneAt = (index: number, patch: Partial<Scene>, base?: Scene[]) => {
    const list = base || scenes;
    const next = list.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onUpdateScenes(next);
    return next;
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

  /**
   * 即時生成下一個分鏡描述（對照故事 + 已完成鏡頭進度）
   * 不依賴預先拆好的 scenes
   */
  const generateNextSceneOnTheFly = async (
    shotIndex: number,
    prevScene: Scene | null,
    advice: string
  ): Promise<Scene> => {
    setPhase('gen_scene');
    addLog(`鏡頭 ${shotIndex + 1}：AI 即時對照故事撰寫分鏡…`, 'info');

    const charSummary = characters
      .map((c) => `${c.name}(${c.gender || '?'}: ${(c.description || '').slice(0, 80)})`)
      .join(' | ');

    const body = {
      novelText: novelText.slice(0, 12000),
      shotIndex,
      previousScene: prevScene
        ? {
            title: prevScene.title,
            character: prevScene.character,
            visualPrompt: prevScene.visualPrompt,
            actionPrompt: prevScene.actionPrompt,
            dialogue: prevScene.dialogue,
            narration: prevScene.narration,
          }
        : null,
      continuityAdvice: advice || '',
      characters: characters.map((c) => ({
        name: c.name,
        gender: c.gender,
        description: c.description,
        clothing: c.clothing,
      })),
      artStyle: artStyle || project.artStyle,
      cameraMotion: cameraMotion || project.cameraMotion,
      mode: 'on_the_fly_chain',
    };

    try {
      // Prefer dedicated endpoint if server supports it
      const data = await apiJson<any>(
        '/api/workflow/generate-next-scene',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
        { timeoutMs: 90000, retries: 1, label: 'GenNextScene' }
      );

      if (data?.scene || data?.title || data?.visualPrompt) {
        const s = data.scene || data;
        const scene: Scene = {
          ...DEFAULT_SCENE,
          id: uid(),
          title: s.title || `鏡頭 ${shotIndex + 1}`,
          dialogue: s.dialogue || '',
          narration: s.narration || '',
          character: s.character || (characters[0]?.name || ''),
          visualPrompt: s.visualPrompt || s.prompt || '',
          actionPrompt: s.actionPrompt || s.motion || '',
          transitionPrompt: s.transitionPrompt || '',
          negativePrompt: s.negativePrompt || '',
          directorNotes: s.directorNotes || advice || '',
          durationSeconds: s.durationSeconds || 8,
          step1PrevShotAdvice: advice || '',
        };
        addLog(`鏡頭 ${shotIndex + 1} 分鏡完成：${scene.title}`, 'ok');
        return scene;
      }
    } catch (e: any) {
      addLog(`專用分鏡 API 不可用，改用通用拆解：${e?.message || e}`, 'warn');
    }

    // Fallback: use a lightweight prompt to the existing chat / split style endpoint
    try {
      const fallbackBody = {
        novelText: novelText.slice(0, 8000),
        instruction: `你是電影分鏡導演。故事進度：已完成 ${shotIndex} 個鏡頭。\n請只產出「下一個鏡頭」（第 ${shotIndex + 1} 鏡）的 JSON，格式：\n{"title":"...","character":"角色名","visualPrompt":"英文畫面描述","actionPrompt":"英文動作/運鏡","dialogue":"對白或空","narration":"旁白或空","durationSeconds":8}\n要求：對照原文推進劇情，保持角色一致，畫面可拍。連續性建議：${advice || '開場建立氛圍'}\n角色資料：${charSummary}`,
        mode: 'single_shot',
      };

      const data2 = await apiJson<any>(
        '/api/workflow/generate-step2-prompt',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...fallbackBody,
            scene: {
              title: `鏡頭 ${shotIndex + 1}`,
              visualPrompt: '',
              character: characters[0]?.name || '',
            },
            novelText: novelText.slice(0, 6000),
            continuityAdvice: advice,
          }),
        },
        { timeoutMs: 90000, retries: 1, label: 'GenSceneFallback' }
      );

      const visual =
        data2?.optimizedPrompt ||
        data2?.visualPrompt ||
        data2?.prompt ||
        `Cinematic shot from the story. ${novelText.slice(0, 200)}`;

      const scene: Scene = {
        ...DEFAULT_SCENE,
        id: uid(),
        title: data2?.title || `鏡頭 ${shotIndex + 1}`,
        dialogue: data2?.dialogue || '',
        narration: data2?.narration || '',
        character: data2?.character || characters[0]?.name || '',
        visualPrompt: visual,
        actionPrompt: data2?.actionPrompt || data2?.motion || 'subtle cinematic camera movement',
        negativePrompt: data2?.optimizedNegative || data2?.negativePrompt || '',
        durationSeconds: 8,
        step1PrevShotAdvice: advice || '',
      };
      addLog(`鏡頭 ${shotIndex + 1} 分鏡（fallback）完成`, 'ok');
      return scene;
    } catch (e2: any) {
      // Last resort: minimal scene from novel snippet
      addLog(`分鏡生成降級為最小模板：${e2?.message || e2}`, 'warn');
      const snippet = novelText.slice(shotIndex * 300, shotIndex * 300 + 400) || novelText.slice(0, 400);
      return {
        ...DEFAULT_SCENE,
        id: uid(),
        title: `鏡頭 ${shotIndex + 1}`,
        dialogue: '',
        narration: '',
        character: characters[0]?.name || '',
        visualPrompt: `Anime key visual, cinematic. ${snippet}. High quality, consistent character design.`,
        actionPrompt: 'slow cinematic camera move, atmospheric',
        durationSeconds: 8,
        step1PrevShotAdvice: advice || '',
      };
    }
  };

  /** Generate start-frame image for a scene */
  const generateImageForScene = async (scene: Scene, index: number, list: Scene[]): Promise<{ url: string; list: Scene[] }> => {
    setPhase('gen_image');
    let nextList = updateSceneAt(index, { isGeneratingImage: true }, list);
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
    nextList = updateSceneAt(index, { imageUrl: data.imageUrl, isGeneratingImage: false }, nextList);
    addLog(`鏡頭 ${index + 1}：首幀完成 ✓`, 'ok');
    return { url: data.imageUrl, list: nextList };
  };

  /** Generate video for a scene */
  const generateVideoForScene = async (
    scene: Scene,
    index: number,
    list: Scene[],
    opts: { imageUrl?: string; extendFromVideoUrl?: string; advice?: string }
  ): Promise<{ url: string; list: Scene[] }> => {
    setPhase('gen_video');
    let nextList = updateSceneAt(index, { isGeneratingVideo: true, videoProgress: '1%' }, list);
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

    if (opts.extendFromVideoUrl) {
      body.extendFromVideoUrl = opts.extendFromVideoUrl;
      addLog(`鏡頭 ${index + 1}：使用上一支影片尾幀作為本鏡頭首幀`, 'info');
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
    nextList = updateSceneAt(
      index,
      {
        videoUrl,
        isGeneratingVideo: false,
        videoProgress: '100%',
        step6Passed: true,
      },
      nextList
    );
    addLog(`鏡頭 ${index + 1}：影片完成 ✓`, 'ok');
    return { url: videoUrl, list: nextList };
  };

  /** Ask AI for next-shot continuity advice */
  const generateAdvice = async (current: Scene): Promise<string> => {
    setPhase('gen_advice');
    addLog('AI 正在撰寫下一鏡頭連續性建議…', 'info');
    try {
      const data = await apiJson<{ advice?: string; summary?: string }>(
        '/api/workflow/generate-step7-advice',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentScene: current,
            novelText: novelText.slice(0, 4000),
            mode: 'on_the_fly',
          }),
        },
        { timeoutMs: 60000, retries: 1, label: 'Advice' }
      );
      const advice =
        data?.advice ||
        '保持角色服裝、光影方向與空間位置一致，鏡頭運動自然銜接，推進下一劇情節點。';
      setLastAdvice(advice);
      addLog('下一鏡頭建議已就緒', 'ok');
      return advice;
    } catch (e: any) {
      const fallback = '保持角色服裝與光影一致，動作自然延續，推進故事。';
      setLastAdvice(fallback);
      addLog(`建議生成略過，使用預設連續性指引`, 'warn');
      return fallback;
    }
  };

  /** START: 即時生成鏡頭 1（分鏡 → 首幀 → 影片 → 建議） */
  const handleStart = async () => {
    if (!novelText) {
      setErrorMsg('請先在「原著小說」頁貼上故事內容，再回來開始即時自動導演');
      return;
    }
    abortRef.current = false;
    setErrorMsg('');
    setLogs([]);
    setExtractedFrameUrl(null);

    try {
      addLog('🚀 即時自動導演啟動 — 鏡頭 1', 'info');

      // 1) On-the-fly scene
      const scene0 = await generateNextSceneOnTheFly(0, null, '');
      let list = [scene0];
      setScenes(list);
      setCurrentIndex(0);

      // 2) Image
      const img = await generateImageForScene(scene0, 0, list);
      list = img.list;

      // 3) Video
      const vid = await generateVideoForScene(list[0], 0, list, { imageUrl: img.url });
      list = vid.list;

      // 4) Advice
      const advice = await generateAdvice(list[0]);
      list = updateSceneAt(0, { step7AdviceForNext: advice }, list);

      setPhase('waiting_continue');
      addLog('✅ 鏡頭 1 完成。按「接下去」即時生成鏡頭 2', 'ok');
    } catch (e: any) {
      setPhase('error');
      setErrorMsg(e?.message || String(e));
      addLog(`錯誤：${e?.message || e}`, 'err');
    }
  };

  /** CONTINUE: 抽尾幀 → 即時分鏡 → 圖/片 → 建議 */
  const handleContinue = async () => {
    const prevIndex = currentIndex;
    const nextIndex = prevIndex + 1;
    const prev = scenes[prevIndex];

    if (!prev?.videoUrl) {
      setErrorMsg('上一鏡頭沒有影片，無法接續');
      return;
    }
    if (!novelText) {
      setErrorMsg('缺少原著小說內容');
      return;
    }

    abortRef.current = false;
    setErrorMsg('');

    try {
      addLog(`── 即時接續鏡頭 ${nextIndex + 1} ──`, 'info');

      // A) Extract last frame
      setPhase('extract_frame');
      addLog(`從鏡頭 ${prevIndex + 1} 影片抽取最後一幀…`, 'info');
      let startFrame: string | undefined;
      try {
        startFrame = await extractLastFrameFromVideo(prev.videoUrl);
        setExtractedFrameUrl(startFrame);
        addLog('尾幀抽取成功', 'ok');
      } catch (ex: any) {
        addLog(`尾幀抽取失敗，改由伺服器 extend 處理：${ex?.message}`, 'warn');
        startFrame = undefined;
      }

      // B) On-the-fly next scene
      const advice = lastAdvice || prev.step7AdviceForNext || '';
      const newScene = await generateNextSceneOnTheFly(nextIndex, prev, advice);
      if (startFrame) {
        newScene.imageUrl = startFrame;
      }

      let list = [...scenes, newScene];
      setScenes(list);
      setCurrentIndex(nextIndex);

      // C) Image — only skip re-draw if tail frame is a PUBLIC CDN URL Agnes can download
      const isPublicCdn = (u?: string) =>
        !!u &&
        u.startsWith('http') &&
        !u.includes('localhost') &&
        !u.includes('127.0.0.1') &&
        !u.includes('.up.railway.app') &&
        !u.includes('railway.app') &&
        !u.includes('/assets/');

      if (!startFrame || !isPublicCdn(startFrame)) {
        if (startFrame && !isPublicCdn(startFrame)) {
          addLog(
            `鏡頭 ${nextIndex + 1}：尾幀非公開 CDN（Agnes 無法下載），改為重新繪製首幀…`,
            'warn'
          );
        }
        const img = await generateImageForScene(
          { ...list[nextIndex], imageUrl: startFrame || list[nextIndex].imageUrl },
          nextIndex,
          list
        );
        list = img.list;
        startFrame = img.url;
      } else {
        addLog(`鏡頭 ${nextIndex + 1}：使用上一鏡公開尾幀作為首幀，跳過重新繪圖`, 'info');
        list = updateSceneAt(nextIndex, { imageUrl: startFrame }, list);
      }

      // D) Video — always pass a public image URL when possible
      const vid = await generateVideoForScene(list[nextIndex], nextIndex, list, {
        imageUrl: startFrame,
        extendFromVideoUrl: !startFrame || !isPublicCdn(startFrame) ? prev.videoUrl : undefined,
        advice,
      });
      list = vid.list;

      // E) Advice for following shot
      const newAdvice = await generateAdvice(list[nextIndex]);
      list = updateSceneAt(nextIndex, { step7AdviceForNext: newAdvice }, list);
      setLastAdvice(newAdvice);
      setExtractedFrameUrl(null);

      setPhase('waiting_continue');
      addLog(`✅ 鏡頭 ${nextIndex + 1} 完成。可繼續按「接下去」生成鏡頭 ${nextIndex + 2}`, 'ok');
    } catch (e: any) {
      setPhase('error');
      setErrorMsg(e?.message || String(e));
      addLog(`錯誤：${e?.message || e}`, 'err');
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

  const isBusy = ['gen_scene', 'gen_image', 'gen_video', 'gen_advice', 'extract_frame'].includes(phase);
  const canStart = (phase === 'idle' || phase === 'error' || phase === 'done') && !!novelText;
  const canContinue = phase === 'waiting_continue' && !!scenes[currentIndex]?.videoUrl;

  return (
    <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-950/80 to-slate-900/80 p-5">
        <h2 className="text-lg font-bold text-violet-200 flex items-center gap-2">
          <Film className="w-5 h-5" />
          一鏡接一鏡 · 即時自動導演
        </h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          <strong className="text-violet-300">唔需要事先拆分鏡。</strong>
          按「開始」後，AI 會即時對照原著故事生成第 1 個鏡頭（分鏡 + 首幀 + 影片）。
          再按「接下去」時，系統從上一支影片抽出最後一幀，結合故事進度即時生成下一鏡頭，如此類推。
        </p>
      </div>

      {/* Novel status */}
      {!novelText && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-950/40 p-3 text-sm text-amber-200">
          請先到「原著小說」頁貼上故事內容，再回來使用即時自動導演。
        </div>
      )}

      {/* Progress chips */}
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
                    ? 'bg-violet-900/50 border-violet-400 text-violet-200 animate-pulse'
                    : 'bg-slate-800/50 border-slate-600 text-slate-500'
              }`}
            >
              {done ? '✓' : active ? '●' : '○'} 鏡頭 {i + 1}
            </div>
          );
        })}
        {scenes.length === 0 && phase === 'idle' && novelText && (
          <span className="text-xs text-slate-500">尚未開始 — 按「開始」即時生成鏡頭 1</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleStart}
          disabled={!canStart || isBusy}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-violet-900/40 transition"
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

      {/* Advice */}
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

      {/* Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenes.map((s, i) => (
          <div key={s.id || i} className="rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-700 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">
                鏡頭 {i + 1} · {s.character || '—'}
              </span>
              {s.videoUrl ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : s.isGeneratingVideo || s.isGeneratingImage ? (
                <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
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
