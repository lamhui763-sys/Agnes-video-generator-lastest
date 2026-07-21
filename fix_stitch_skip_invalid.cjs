/**
 * fix_stitch_skip_invalid.cjs
 * - When stitching, automatically skip invalid / non-video URLs
 * - Stronger error messages (valid count, skipped list, server hint)
 * - Applies to both full-auto and manual stitch paths
 */
const fs = require("fs");
const path = require("path");

const APP = path.join(process.cwd(), "src", "App.tsx");
if (!fs.existsSync(APP)) {
  console.error("[fix_stitch_skip_invalid] src/App.tsx not found");
  process.exit(0);
}

let src = fs.readFileSync(APP, "utf8");
const original = src;
const MARKER = "TOONFLOW_STITCH_SKIP_INVALID_V1";

if (src.includes(MARKER)) {
  console.log("[fix_stitch_skip_invalid] already applied");
  process.exit(0);
}

// Helper function to inject once near top of full-auto or before first use
const HELPER = `
  // ${MARKER}
  const isUsableVideoUrl = (url: any): boolean => {
    if (!url || typeof url !== "string") return false;
    const u = url.trim();
    if (!u || u === "null" || u === "undefined") return false;
    // Reject known non-video / stock / placeholder
    if (u.includes("unsplash.com")) return false;
    if (u.includes("pollinations-fallback")) return false;
    if (u.includes("mixkit.co")) return false;
    if (u.includes("gradient") || u.includes("placeholder")) return false;
    // Reject pure image data URLs or image extensions used as video by mistake
    if (u.startsWith("data:image")) return false;
    if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(u) && !u.includes("/api/") && !u.includes("catbox")) return false;
    // Must look like a reachable media path
    if (!(u.startsWith("http") || u.startsWith("/assets/") || u.startsWith("/api/") || u.startsWith("data:video"))) return false;
    if (u.length < 8) return false;
    return true;
  };
`;

// Inject helper just before the final stitching block in full-auto
const STITCH_START = 'setFullAutoLogs(prev => [...prev, "🎬 第四步：所有分鏡鏡頭已完美生成完畢！正在啟動 AI 剪輯大師，極速拼接大片中..."]);';
if (!src.includes(STITCH_START)) {
  console.error("[fix_stitch_skip_invalid] full-auto stitch start log not found");
  process.exit(1);
}

src = src.replace(STITCH_START, HELPER + "\n      " + STITCH_START);

// Replace orderedVideoUrls collection in full-auto
const OLD_COLLECT = `const orderedVideoUrls = (finalProj?.scenes || currentScenes)
        .map(s => s.videoUrlKeyframes || s.videoUrlExt || s.videoUrl)
        .filter(Boolean) as string[];

      if (orderedVideoUrls.length === 0) {
        throw new Error("沒有生成任何有效的影片分鏡，無法進行最終拼接剪輯。");
      }

      setFullAutoLogs(prev => [...prev, \\`🎞️ 正在向剪輯核心提交 \${orderedVideoUrls.length} 個分鏡鏡頭檔案...\\`]);`;

// More flexible regex replace for collection
const collectRe = /const orderedVideoUrls = \(finalProj\?\.scenes \|\| currentScenes\)\s*\.map\(s => s\.videoUrlKeyframes \|\| s\.videoUrlExt \|\| s\.videoUrl\)\s*\.filter\(Boolean\) as string\[];\s*if \(orderedVideoUrls\.length === 0\) \{\s*throw new Error\("[^"\n]+"\);\s*\}\s*setFullAutoLogs\(prev => \[\.\.\.prev, `🎞️ 正在向剪輯核心提交 \$\{orderedVideoUrls\.length\} 個分鏡鏡頭檔案\.\.\.`\]\);/;

const NEW_COLLECT = `const rawScenesForStitch = finalProj?.scenes || currentScenes;
      const orderedVideoUrls: string[] = [];
      const skippedStitchScenes: string[] = [];
      rawScenesForStitch.forEach((s: any, idx: number) => {
        const cand = s.videoUrlKeyframes || s.videoUrlExt || s.videoUrl;
        if (isUsableVideoUrl(cand)) {
          orderedVideoUrls.push(cand);
        } else {
          skippedStitchScenes.push(\\'鏡頭 \\' + (idx + 1) + (s.title ? \\'「\\' + s.title + \\'」\\' : \\'\\') + \\' (\\' + (cand ? String(cand).slice(0, 48) + \\'…\\' : \\'空\\') + \\')\\');
        }
      });

      if (skippedStitchScenes.length > 0) {
        setFullAutoLogs(prev => [...prev, \\'⚠️ 拼接前自動跳過 \\' + skippedStitchScenes.length + \\' 個無效/非影片網址：\\', ...skippedStitchScenes.map(x => \\'   · \\' + x)]);
      }

      if (orderedVideoUrls.length === 0) {
        throw new Error(\"沒有任何有效影片網址可拼接（共 \\