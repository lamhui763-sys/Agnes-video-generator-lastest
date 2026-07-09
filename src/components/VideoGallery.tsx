import React, { useState, useEffect } from "react";
import { Download, Film, RefreshCw } from "lucide-react";

export default function VideoGallery() {
  const [videos, setVideos] = useState<{filename: string, url: string, createdAt: string}[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-purple-500/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Film className="text-purple-400" /> 影片歷史庫
        </h2>
        <button 
          onClick={fetchVideos}
          disabled={loading}
          className="text-gray-400 hover:text-white transition"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      
      {videos.length === 0 ? (
        <p className="text-gray-500 text-center py-8">暫無生成過的影片</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <div key={video.filename} className="bg-gray-800 p-3 rounded-lg flex items-center justify-between border border-gray-700">
              <span className="text-xs text-gray-300 truncate font-mono mr-2">{video.filename}</span>
              <a
                href={`/api/download?url=${encodeURIComponent(video.url)}`}
                className="bg-purple-600 text-white text-xs px-3 py-1.5 rounded-full hover:bg-purple-700 transition flex items-center gap-1 shrink-0"
                download={video.filename}
              >
                <Download className="w-3 h-3" /> 下載
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
