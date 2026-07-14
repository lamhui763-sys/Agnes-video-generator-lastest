import React from "react";
import { motion } from "motion/react";
import { Sparkles, User, Clapperboard, Video, Eye, Cpu } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
  currentUser: any;
  isAuthLoading: boolean;
  onSignIn: () => void;
}

export default function AuthWrapper({
  children,
  currentUser,
  isAuthLoading,
  onSignIn,
}: AuthWrapperProps) {
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-pink-600/10 blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-indigo-600/10 blur-3xl animate-pulse" style={{ animationDuration: "12s" }} />
        
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-spin" style={{ animationDuration: "3s" }}>
              <Clapperboard className="w-8 h-8 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 font-mono tracking-widest uppercase">
            Toonflow Platform
          </p>
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative px-4 overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-slate-900/40 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Top Floating Glow Tag */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs text-indigo-300 font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 動態短劇生成新紀元</span>
          </span>
        </div>

        {/* Card Body */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex p-3.5 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner mb-2">
              <Clapperboard className="w-10 h-10 text-pink-500 animate-pulse" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Toonflow Platform
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              一鍵將小說段落拆解為精美分鏡與高畫質 AI 影片。建立專屬角色一致性與 3D 運鏡。
            </p>
          </div>

          {/* Quick Features Highlight List */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3 p-3 bg-slate-950/40 border border-slate-850/50 rounded-xl">
              <div className="p-1.5 bg-pink-500/10 rounded-lg shrink-0">
                <Cpu className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">一鍵 AI 拆解分鏡</h4>
                <p className="text-[10px] text-slate-400">自動分析小說段落、識別人物對白、生成視覺英文 Prompt</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-950/40 border border-slate-850/50 rounded-xl">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg shrink-0">
                <Video className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">角色一致性與 HTML5 錄製</h4>
                <p className="text-[10px] text-slate-400">儲存專屬角色屬性，一鍵錄製高清寬畫幅 WebM 影片與字幕</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={onSignIn}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <User className="w-4 h-4" />
              <span>使用 Google 帳號登入同步</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center leading-normal">
              透過安全加密通道進行 Google 身份驗證。您將獲得獨立專屬的雲端資料儲存庫。
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6">
          <p className="text-[10px] text-slate-600 tracking-wide uppercase font-mono">
            Toonflow Platform © 2026. All Rights Reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
