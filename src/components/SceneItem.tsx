import React from 'react';
import { Scene, Character, Project } from '../types';
import { Trash2, GripVertical, Clock, Info, Sparkles, Users, ChevronLeft, Plus, RefreshCw, Upload } from 'lucide-react';
import { STYLE_PRESETS } from '../data'; // Need to make sure this is available

interface SceneItemProps {
  scene: Scene;
  index: number;
  activeProjectCharacters: Character[];
  handleUpdateSceneField: (sceneId: string, field: keyof Scene, value: string | number | boolean) => void;
  handleDeleteScene: (sceneId: string) => void;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  draggedIndex: number | null;
  draggedOverIndex: number | null;
  matchingChar: Character | undefined;
  handleApplyStylePreset: (sceneId: string, preset: string) => void;
  handleImageDragOver: (e: React.DragEvent) => void;
  handleImageDrop: (e: React.DragEvent, sceneId: string, field: keyof Scene) => void;
  handleUploadSceneImage: (e: React.ChangeEvent<HTMLInputElement>, sceneId: string, field: keyof Scene) => void;
  activeProjectId: string;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const SceneItem: React.FC<SceneItemProps> = React.memo(({
  scene,
  index,
  activeProjectCharacters,
  handleUpdateSceneField,
  handleDeleteScene,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  draggedIndex,
  draggedOverIndex,
  matchingChar,
  handleApplyStylePreset,
  handleImageDragOver,
  handleImageDrop,
  handleUploadSceneImage,
  activeProjectId,
  setProjects,
  showToast
}) => {
  return (
    <div 
      key={scene.id}
      draggable
      onDragStart={(e) => handleDragStart(e, index)}
      onDragOver={(e) => handleDragOver(e, index)}
      onDragEnd={handleDragEnd}
      onDrop={(e) => handleDrop(e, index)}
      className={`bg-slate-900/60 border rounded-2xl p-6 shadow-xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 relative group transition-all duration-200 ${
        draggedIndex === index 
          ? "opacity-35 border-indigo-500/50 scale-[0.98] shadow-inner" 
          : draggedOverIndex === index 
          ? "border-indigo-400 bg-slate-900/90 shadow-indigo-500/10 shadow-2xl scale-[1.01] ring-2 ring-indigo-500/20" 
          : "border-slate-800"
      }`}
    >
      <button
        onClick={() => handleDeleteScene(scene.id)}
        className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-red-950/80 border border-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition"
        title="刪除此分鏡"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <div className="md:col-span-7 flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <div 
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 rounded cursor-grab active:cursor-grabbing transition"
            title="拖曳調整場景順序"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
            場景 {index + 1}
          </span>
          {scene.durationSeconds && (
            <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {scene.durationSeconds}s
            </span>
          )}
          <input
            type="text"
            className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-slate-850 focus:border-indigo-500 focus:outline-none w-full pb-0.5 transition"
            value={scene.title}
            onChange={(e) => handleUpdateSceneField(scene.id, "title", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">出場角色</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              value={scene.character}
              onChange={(e) => handleUpdateSceneField(scene.id, "character", e.target.value)}
              placeholder="例如：主角"
            />
            {activeProjectCharacters && activeProjectCharacters.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {activeProjectCharacters.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleUpdateSceneField(scene.id, "character", c.name)}
                    className={`px-1.5 py-0.5 rounded text-[9px] border transition cursor-pointer ${
                      (scene.character || "").trim().toLowerCase() === (c.name || "").trim().toLowerCase()
                        ? "bg-pink-950/80 text-pink-400 border-pink-500/40 font-bold"
                        : "bg-slate-950 text-slate-500 border-slate-850 hover:text-slate-300 hover:border-slate-800"
                    }`}
                    title={`快速選擇：${c.name}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center mb-0.5">
              <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">視頻時長 (秒)</label>
            </div>
            <input
              type="number"
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              value={scene.durationSeconds || ""}
              onChange={(e) => handleUpdateSceneField(scene.id, "durationSeconds", parseInt(e.target.value as string))}
            />
          </div>
        </div>
        
        {/* Subtitle / Dialogue / Audio Cue Split */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-indigo-400 font-bold uppercase flex items-center gap-1">
              <span>🗣️ 角色說的話 (台詞對白)</span>
            </label>
            <textarea
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition min-h-[60px]"
              value={scene.dialogue || ""}
              onChange={(e) => handleUpdateSceneField(scene.id, "dialogue", e.target.value)}
              placeholder='例如：「我有個秘密要告訴你。」（嘴唇會對應說話，無對話請留空）'
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
              <span>📖 背景場景旁白 (旁白字幕)</span>
            </label>
            <textarea
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition min-h-[60px]"
              value={scene.narration || ""}
              onChange={(e) => handleUpdateSceneField(scene.id, "narration", e.target.value)}
              placeholder="例如：夜色漸深，窗外的雨滴答作響，他心中滿是焦慮...（嘴唇不會說話）"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-pink-400 font-bold uppercase flex items-center gap-1">
              <span>🎵 氛圍音效與背景音樂 (鏡頭音訊)</span>
            </label>
            <textarea
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-pink-500 transition min-h-[60px]"
              value={scene.audioCue || ""}
              onChange={(e) => handleUpdateSceneField(scene.id, "audioCue", e.target.value)}
              placeholder="例如：窗外淅淅瀝瀝的下雨聲，或者是雨停後的寂靜無雨聲。"
            />
          </div>
        </div>

        {/* English Visual Prompt */}
        <div className="space-y-1">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">
              繪圖/影片視覺描述提示詞 (English Prompt)
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-500 font-bold">🪄 預設庫:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleApplyStylePreset(scene.id, e.target.value);
                    e.target.value = "";
                  }
                }}
                className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] text-indigo-400 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>-- 快速套用視覺風格 --</option>
                {STYLE_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <textarea
            className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition min-h-[80px]"
            value={scene.visualPrompt || ""}
            onChange={(e) => handleUpdateSceneField(scene.id, "visualPrompt", e.target.value)}
          />
        </div>
        {/* Action Prompt */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">
            影片動作描述提示詞 (Action Prompt)
          </label>
          <textarea
            className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition min-h-[50px]"
            value={scene.actionPrompt || ""}
            onChange={(e) => handleUpdateSceneField(scene.id, "actionPrompt", e.target.value)}
          />
        </div>

        {/* Transition Prompt */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">
            過渡到下個場景提示詞 (Transition Prompt)
          </label>
          <textarea
            className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition min-h-[40px]"
            value={scene.transitionPrompt || ""}
            onChange={(e) => handleUpdateSceneField(scene.id, "transitionPrompt", e.target.value)}
          />
        </div>

        {/* Director's Personal Notes */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-amber-500 font-bold uppercase flex items-center gap-1">
            <span>🎬 導演註記 / 個人拍攝筆記 (Director's & Personal Notes)</span>
          </label>
          <textarea
            className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition min-h-[60px]"
            value={scene.directorNotes || ""}
            onChange={(e) => handleUpdateSceneField(scene.id, "directorNotes", e.target.value)}
            placeholder="在此撰寫該分鏡的導演註記、燈光配置、運鏡細節或個人備忘筆記..."
          />
        </div>
      </div>

      {/* Right Col: Storyboard Image / Agnes Video Generation Frame */}
      <div className="md:col-span-5 flex flex-col justify-between space-y-4">
        <div 
          onDragOver={handleImageDragOver}
          onDrop={(e) => handleImageDrop(e, scene.id, "imageUrl")}
          onClick={() => document.getElementById(`upload-scene-img-${scene.id}`)?.click()}
          className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-800 shadow-inner flex flex-col items-center justify-center group/img cursor-pointer"
          title="點擊或拖曳圖片至此處上傳自訂照片"
        >
          <input 
            type="file" 
            id={`upload-scene-img-${scene.id}`} 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => handleUploadSceneImage(e, scene.id, "imageUrl")} 
          />

          {scene.imageUrl ? (
            <div className="relative w-full h-full">
              <img 
                src={scene.imageUrl} 
                alt={scene.title} 
                className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out transform scale-100 group-hover/img:scale-105" 
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5">
                <Upload className="w-5 h-5 text-indigo-400 animate-bounce" />
                <span className="text-[11px] font-bold text-slate-200">點擊或拖曳更換自訂照片</span>
              </div>
              {/* Manual redo / reset button */}
              <div className="absolute top-2 right-2 flex gap-1 z-30">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (confirm("您確定要重置並重新繪製此分鏡插圖嗎？(這也會清除已生成的影片)")) {
                      setProjects(prevProjects => {
                        const updatedList = prevProjects.map(p => {
                          if (p.id === activeProjectId) {
                            const updatedScenes = p.scenes.map(s => {
                              if (s.id === scene.id) {
                                return {
                                  ...s,
                                  imageUrl: undefined,
                                  videoUrl: undefined,
                                  videoProgress: undefined,
                                  videoLogs: undefined,
                                  videoError: undefined
                                };
                              }
                              return s;
                            });
                            return { ...p, scenes: updatedScenes };
                          }
                          return p;
                        });
                        try { localStorage.setItem("toonflow_projects", JSON.stringify(updatedList)); } catch (err) { console.error(err); }
                        return updatedList;
                      });
                      showToast("已成功重置！您可以現在重新繪圖或重新生成影片。", "success");
                    }
                  }}
                  className="bg-red-950/90 hover:bg-red-800 text-white px-2 py-1 rounded text-[9px] font-bold transition shadow flex items-center gap-1 border border-red-700/50 z-45 cursor-pointer active:scale-95"
                  title="不滿意插圖嗎？點此重置以重新繪製"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>重做/重置此影鏡</span>
                </button>
              </div>
            </div>
          ) : scene.isGeneratingImage ? (
            <div className="flex flex-col items-center space-y-3" onClick={(e) => e.stopPropagation()}>
              <RefreshCw className="w-6 h-6 text-pink-500 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 opacity-50 group-hover/img:opacity-100 transition-opacity">
              <Upload className="w-8 h-8 text-slate-500" />
              <p className="text-xs text-slate-400 font-medium">拖曳圖片或點擊上傳</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default SceneItem;
