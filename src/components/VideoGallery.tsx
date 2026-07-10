import React, { useState, useEffect } from "react";
import { Download, Film, RefreshCw, Clapperboard, Video, Trash2 } from "lucide-react";
import { ScrubbableVideoPlayer } from "./ScrubbableVideoPlayer";
import { Project } from "../types";

interface VideoGalleryProps {
  activeProject?: Project | null;
}

export default function VideoGallery({ activeProject }: VideoGalleryProps) {
  const [videos, setVideos] = useState<{filename: string, url: string, createdAt: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/list-videos");
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setVideos(data.videos);
      } else {
        console.warn("Failed to fetch videos. Status:", res.status, "Content-Type:", contentType);
      }
    } catch (e) {
      console.error("Failed to fetch videos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Find match for a video url in activeProject or from descriptive filename
  const getSceneMatch = (videoUrl: string) => {
    const cleanUrl = (url: string) => {
      try {
        const parts = url.split('/');
        return parts[parts.length - 1].split('?')[0];
      } catch {
        return url;
      }
    };
    
    const targetFilename = cleanUrl(videoUrl);
    if (!targetFilename) return null;

    // 1. First, try parsing from the descriptive filename format (newly generated files)
    const fnMatch = targetFilename.match(/agnes-video-(standard|ext|keyframes)-scene-(\d+)/);
    if (fnMatch) {
      const type = fnMatch[1];
      const index = parseInt(fnMatch[2], 10) - 1;
      let label = "";
      let subType = "";
      if (type === "standard") {
        label = `鏡頭 ${index + 1}`;
        subType = "標準";
      } else if (type === "ext") {
        label = `擴展鏡頭 ${index + 1}`;
        subType = "擴展";
      } else if (type === "keyframes") {
        label = `對渡鏡頭 ${index + 1}`;
        subType = "關鍵影格";
      }
      
      let title = "未命名分鏡";
      if (activeProject) {
        if (type === "standard" && activeProject.scenes && activeProject.scenes[index]) {
          title = activeProject.scenes[index].title || title;
        } else if (type === "ext" && activeProject.scenesExt && activeProject.scenesExt[index]) {
          title = activeProject.scenesExt[index].title || title;
        } else if (type === "keyframes" && activeProject.scenesFirstLast && activeProject.scenesFirstLast[index]) {
          title = activeProject.scenesFirstLast[index].title || title;
        }
      }
      return { index, label, title, subType };
    }

    // 2. If no filename match or no activeProject, fall back to URL/path matching
    if (!activeProject) return null;

    // Helper helper to check urls
    const urlsMatch = (sceneUrl: string | undefined, sceneUrlLocal: string | undefined) => {
      if (!sceneUrl && !sceneUrlLocal) return false;
      return (sceneUrl && cleanUrl(sceneUrl) === targetFilename) || 
             (sceneUrlLocal && cleanUrl(sceneUrlLocal) === targetFilename);
    };

    if (activeProject.scenes) {
      for (let i = 0; i < activeProject.scenes.length; i++) {
        const scene = activeProject.scenes[i];
        if (urlsMatch(scene.videoUrl, (scene as any).videoUrlLocal)) {
          return { index: i, label: `鏡頭 ${i + 1}`, title: scene.title || "未命名分鏡", subType: "標準" };
        }
        if (urlsMatch(scene.videoUrlExt, (scene as any).videoUrlExtLocal)) {
          return { index: i, label: `鏡頭 ${i + 1}`, title: scene.title || "未命名分鏡", subType: "擴展" };
        }
        if (urlsMatch(scene.videoUrlKeyframes, (scene as any).videoUrlKeyframesLocal)) {
          return { index: i, label: `鏡頭 ${i + 1}`, title: scene.title || "未命名分鏡", subType: "關鍵影格" };
        }
      }
    }

    if (activeProject.scenesExt) {
      for (let i = 0; i < activeProject.scenesExt.length; i++) {
        const scene = activeProject.scenesExt[i];
        if (urlsMatch(scene.videoUrl, (scene as any).videoUrlLocal)) {
          return { index: i, label: `擴展鏡頭 ${i + 1}`, title: scene.title || "未命名分鏡", subType: "標準" };
        }
        if (urlsMatch(scene.videoUrlExt, (scene as any).videoUrlExtLocal)) {
          return { index: i, label: `擴展鏡頭 ${i + 1}`, title: scene.title || "未命名分鏡", subType: "擴展" };
        }
      }
    }

    if (activeProject.scenesFirstLast) {
      for (let i = 0; i < activeProject.scenesFirstLast.length; i++) {
        const scene = activeProject.scenesFirstLast[i];
        if (urlsMatch(scene.videoUrl, (scene as any).videoUrlLocal)) {
          return { index: i, label: `對渡鏡頭 ${i + 1}`, title: scene.title || "未命名分鏡", subType: "標準" };
        }
        if (urlsMatch(scene.videoUrlExt, (scene as any).videoUrlExtLocal)) {
          return { index: i, label: `對渡鏡頭 ${i + 1}`, title: scene.title || "未命名分鏡", subType: "擴展" };
        }
        if (urlsMatch(scene.videoUrlKeyframes, (scene as any).videoUrlKeyframesLocal)) {
          return { index: i, label: `對渡鏡頭 ${i + 1}`, title: scene.title || "未命名分鏡", subType: "關鍵影格" };
        }
      }
    }

    return null;
  };

  // Process and sort videos strictly by scene index ascending, with fallback to creation date
  const processedVideos = React.useMemo(() => {
    const mapped = videos.map(v => ({
      ...v,
      match: getSceneMatch(v.url)
    }));

    return mapped.sort((a, b) => {
      const matchA = a.match;
      const matchB = b.match;

      if (matchA && matchB) {
        // Sort strictly by scene index ascending (鏡頭一、二、三的順序)
        if (matchA.index !== matchB.index) {
          return matchA.index - matchB.index;
        }
        
        // Same scene index: sort by subtype precedence (標準 -> 關鍵影格 -> 擴展)
        const subTypeOrder = { "標準": 1, "關鍵影格": 2, "擴展": 3 } as any;
        const orderA = subTypeOrder[matchA.subType] || 9;
        const orderB = subTypeOrder[matchB.subType] || 9;
        return orderA - orderB;
      } else if (matchA) {
        // Matched comes before unmatched
        return -1;
      } else if (matchB) {
        return 1;
      } else {
        // Unmatched: sort by file creation date descending (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [videos, activeProject]);

  // Set selected video to the first item if none is currently selected
  useEffect(() => {
    if (processedVideos.length > 0 && !selectedVideoUrl) {
      setSelectedVideoUrl(processedVideos[0].url);
    }
  }, [processedVideos, selectedVideoUrl]);

  const handleDelete = async (e: React.MouseEvent, filename: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/delete-video?filename=${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchVideos();
      } else {
        console.error("Failed to delete video");
      }
    } catch (e) {
      console.error("Error deleting video:", e);
    }
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 shadow-xl backdrop-blur-md space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Film className="w-4 h-4 text-emerald-400" /> 已生成影片庫 (Generated Videos)
        </h2>
        <button 
          onClick={fetchVideos}
          disabled={loading}
          className="text-gray-400 hover:text-white transition flex items-center gap-1 text-xs"
          title="重新整理"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="sr-only">重新整理</span>
        </button>
      </div>

      {selectedVideoUrl && (
        <div className="space-y-3">
          <div className="relative aspect-video rounded-xl overflow-hidden border border-emerald-500/20 bg-slate-950 shadow-inner">
            <ScrubbableVideoPlayer
              src={selectedVideoUrl}
              className="w-full h-full"
            />
          </div>
          <div className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-lg border border-slate-850">
            <span className="text-[10px] text-slate-500 font-mono break-all">
              正在播放: {selectedVideoUrl.split('/').pop()}
            </span>
            <a
              href={`/api/download?url=${encodeURIComponent(selectedVideoUrl)}`}
              className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
              download={selectedVideoUrl.split('/').pop() || 'video.mp4'}
            >
              <Download className="w-3.5 h-3.5" /> 下載此影片
            </a>
          </div>
        </div>
      )}
      
      {processedVideos.length === 0 ? (
        <p className="text-gray-500 text-center py-8 text-xs">暫無生成過的影片</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {processedVideos.map((video) => {
            const isSelected = selectedVideoUrl === video.url;
            const match = video.match;
            
            return (
              <div 
                key={video.filename} 
                onClick={() => setSelectedVideoUrl(video.url)}
                className={`p-3 rounded-xl flex items-center justify-between border transition cursor-pointer ${
                  isSelected 
                    ? "bg-emerald-950/20 border-emerald-500/40 text-white" 
                    : "bg-slate-950/40 border-slate-850/60 text-slate-300 hover:bg-slate-950 hover:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 mr-2">
                  <div className={`p-1.5 rounded-lg ${isSelected ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-900 text-slate-500"}`}>
                    {match ? <Clapperboard className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {match ? `${match.label} (${match.subType})` : "其他未綁定影片"}
                      </span>
                      {match && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {match.title}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate max-w-[280px] mt-0.5">
                      {video.filename}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/api/download?url=${encodeURIComponent(video.url)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                    title="下載"
                    download={video.filename}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={(e) => handleDelete(e, video.filename)}
                    className="p-1.5 bg-slate-850 hover:bg-red-900/50 text-slate-400 hover:text-red-400 rounded-lg transition"
                    title="刪除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
