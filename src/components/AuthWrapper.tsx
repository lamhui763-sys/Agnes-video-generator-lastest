import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  User, 
  Clapperboard, 
  Video, 
  Cpu, 
  Mail, 
  Lock, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Globe
} from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
  currentUser: any;
  isAuthLoading: boolean;
  onSignIn: () => void;
  onCustomSignIn: (user: any) => void;
}

export default function AuthWrapper({
  children,
  currentUser,
  isAuthLoading,
  onSignIn,
  onCustomSignIn,
}: AuthWrapperProps) {
  const [authMethod, setAuthMethod] = useState<"google" | "email">("google");
  const [emailMode, setEmailMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Clear errors on change
  const handleMethodChange = (method: "google" | "email") => {
    setAuthMethod(method);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("請輸入完整的電子郵件與密碼");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("密碼長度必須至少為 6 個字元");
      return;
    }
    if (emailMode === "register" && !displayName.trim()) {
      setErrorMsg("請輸入您的顯示名稱");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLocalLoading(true);

    try {
      const endpoint = emailMode === "register" ? "/api/custom-auth/register" : "/api/custom-auth/login";
      const payload = emailMode === "register" 
        ? { email, password, displayName } 
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "驗證失敗，請重新確認");
      }

      setSuccessMsg(emailMode === "register" ? "註冊並登入成功！" : "登入成功！");
      
      // Trigger login in App
      setTimeout(() => {
        onCustomSignIn(data);
      }, 500);

    } catch (err: any) {
      console.error("Email custom auth error:", err);
      setErrorMsg(err.message || "伺服器驗證失敗，請稍後再試");
    } finally {
      setLocalLoading(false);
    }
  };

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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative px-4 py-12 overflow-y-auto">
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

          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex p-3.5 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner mb-1">
              <Clapperboard className="w-10 h-10 text-pink-500 animate-pulse" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Toonflow Platform
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              一鍵將小說段落拆解為精美分鏡與高畫質 AI 影片。建立專屬角色一致性與 3D 運鏡。
            </p>
          </div>

          {/* Quick Tabs to toggle between Google Sign-in & Email/Password */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => handleMethodChange("google")}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "google"
                  ? "bg-gradient-to-r from-pink-600/20 to-indigo-600/20 text-white border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Google 快速登入</span>
            </button>
            <button
              type="button"
              onClick={() => handleMethodChange("email")}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "email"
                  ? "bg-gradient-to-r from-pink-600/20 to-indigo-600/20 text-white border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>信箱密碼登入</span>
            </button>
          </div>

          {/* Notification Messages */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2 overflow-hidden"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2 overflow-hidden"
              >
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab 1: Google Login */}
          {authMethod === "google" && (
            <div className="space-y-6">
              {/* Quick Features Highlight List */}
              <div className="space-y-3">
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

              <div className="space-y-4 pt-2">
                <button
                  type="button"
                  onClick={onSignIn}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <User className="w-4 h-4" />
                  <span>使用 Google 帳號快速登入</span>
                </button>

                {/* Helpful Warning on Railway Unauthorized Domain */}
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>在 Railway / 自訂網域上部署？</span>
                  </div>
                  <p className="leading-relaxed opacity-85">
                    如果您在 Railway 遇到 Google 登入錯誤 (<code className="text-pink-300">unauthorized-domain</code>)，這是因為 Firebase 安全限制不允許未授權網域。
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowGuide(!showGuide)}
                    className="text-pink-400 hover:text-pink-300 font-bold underline flex items-center gap-1 cursor-pointer mt-1"
                  >
                    <span>查看解決方法 或 改用「信箱密碼登入」 ⚡</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Email & Password Auth (Works perfectly everywhere, no domain restriction!) */}
          {authMethod === "email" && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  {emailMode === "login" ? "請登入您的帳號" : "註冊您的全新帳號"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmailMode(emailMode === "login" ? "register" : "login");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer"
                >
                  {emailMode === "login" ? "沒有帳號？立即註冊" : "已有帳號？直接登入"}
                </button>
              </div>

              {emailMode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 block">顯示名稱</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="例如：創作者大師"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 block">電子郵件信箱</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="your-email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 block font-mono">設定密碼 (至少 6 位數)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 pl-10 pr-11 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={localLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 cursor-pointer mt-2"
              >
                {localLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>{emailMode === "login" ? "信箱安全登入" : "註冊並自動登入"}</span>
                  </>
                )}
              </button>

              <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl text-[10px] text-slate-500 leading-normal text-center">
                💡 <b>完美支援自訂網域：</b>信箱密碼登入完全不受網域限制，可以在您的 Railway, GitHub Pages, Vercel 等任何部署網址完美運作，並與您的個人雲端資料同步！
              </div>
            </form>
          )}
        </div>

        {/* Floating Domain Authorization Guide modal overlay */}
        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowGuide(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 text-indigo-400">
                  <Globe className="w-5 h-5" />
                  <h3 className="font-bold text-sm">如何讓 Google 登入支援 Railway？</h3>
                </div>

                <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    如果您希望在您部署的 Railway 自訂網域名稱上也能使用 <b>Google 快速登入</b>，只需 2 分鐘在 Firebase Console 完成設定：
                  </p>
                  
                  <ol className="list-decimal list-inside space-y-2 bg-slate-950 p-3.5 border border-slate-850 rounded-xl font-mono text-[11px] text-slate-400">
                    <li>
                      進入 <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-pink-400 underline font-bold">Firebase 控制台</a> 并選擇您的專案。
                    </li>
                    <li>
                      點選左側選單的 <b>Authentication (驗證)</b> 項目。
                    </li>
                    <li>
                      切換到最上方的 <b>Settings (設定)</b> 標籤頁。
                    </li>
                    <li>
                      在左側欄位選取 <b>Authorized domains (授權網域)</b>。
                    </li>
                    <li>
                      點選 <b>Add domain (新增網域)</b> 按钮，輸入您的 Railway 網址 (例如：<code className="text-pink-300">your-app.up.railway.app</code>) 並保存。
                    </li>
                  </ol>

                  <p className="text-slate-400 text-[11px]">
                    💡 <b>替代方案：</b> 點選右上角的「<b>信箱密碼登入</b>」頁籤，您可以用任何信箱立即登入，這不需任何 Firebase 網域設定，可 100% 直接在 Railway 上運行！
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGuide(false)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    我明白了
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
