/**
 * fix_lenient_skip_reviews.cjs
 * When strictWorkflowLock is OFF (Lenient):
 * - Skip STEP 4 (image review) entirely → auto-pass all step4Passed
 * - Skip video review inside STEP 6 → auto-pass step6Passed after video ready
 * Effectively reduces 7-step master workflow to 5 steps.
 */
const fs = require("fs");
const path = require("path");

const APP = path.join(process.cwd(), "src", "App.tsx");
if (!fs.existsSync(APP)) {
  console.error("[fix_lenient_skip_reviews] src/App.tsx not found");
  process.exit(0);
}

let src = fs.readFileSync(APP, "utf8");
const original = src;

// Marker to avoid double-apply
const MARKER = "TOONFLOW_LENIENT_SKIP_REVIEWS_V1";
if (src.includes(MARKER)) {
  console.log("[fix_lenient_skip_reviews] already applied");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 1) Replace STEP 4 block: when !strictWorkflowLock, auto-pass and skip reviews
// ---------------------------------------------------------------------------
const step4Start = `// =========================================================================
      // STEP 4: AI 檢查所有首幀是否合理 + 故事連貫性
      // =========================================================================
      setFullAutoLogs(prev => [...prev, "🎬 [步驟 4] AI 正在檢查所有首幀合理性與故事連貫性..."]);`;

const step4Lenient = `// =========================================================================
      // STEP 4: AI 檢查所有首幀是否合理 + 故事連貫性
      // ${MARKER}
      // =========================================================================
      if (!strictWorkflowLock) {
        // Lenient: skip ALL image reviews → 7-step becomes 5-step
        setFullAutoLogs(prev => [...prev, "🔓 [步驟 4 已跳過] 嚴格鎖關閉 (Lenient)：所有首幀審查直接通過，進入 5 步極速流程..."]);
        for (let i = 0; i < currentScenes.length; i++) {
          const scene = currentScenes[i];
          updateActiveProject((prev) => ({
            scenes: prev.scenes.map(s => s.id === scene.id ? {
              ...s,
              step4ImageReviewScore: 100,
              step4ImageReviewText: "（Lenient 模式）已跳過圖片審查，直接通過。",
              step4Passed: true,
              isReviewingStep4: false,
              workflowStep: 4
            } : s)
          }));
          try {
            const curList = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
            const updatedList = curList.map(p => p.id === activeProjectId ? {
              ...p,
              scenes: p.scenes.map(s => s.id === scene.id ? {
                ...s,
                step4ImageReviewScore: 100,
                step4ImageReviewText: "（Lenient 模式）已跳過圖片審查，直接通過。",
                step4Passed: true,
                isReviewingStep4: false,
                workflowStep: 4
              } : s)
            } : p);
            localStorage.setItem("toonflow_projects", JSON.stringify(updatedList));
            localStorage.setItem("toonflow_last_sync_timestamp", Date.now().toString());
          } catch(e) {}
        }
        setFullAutoLogs(prev => [...prev, "✅ [步驟 4] 全部鏡頭圖片審查已跳過並標記通過。"]);
      } else {
      setFullAutoLogs(prev => [...prev, "🎬 [步驟 4] AI 正在檢查所有首幀合理性與故事連貫性..."]);`;

if (!src.includes(step4Start)) {
  const alt = `setFullAutoLogs(prev => [...prev, "🎬 [步驟 4] AI 正在檢查所有首幀合理性與故事連貫性..."]);`;
  if (!src.includes(alt)) {
    console.error("[fix_lenient_skip_reviews] STEP 4 marker not found");
    process.exit(1);
  }
  src = src.replace(alt, step4Lenient.split("setFullAutoLogs")[0] + `setFullAutoLogs(prev => [...prev, "🎬 [步驟 4] AI 正在檢查所有首幀合理性與故事連貫性..."]);`);
} else {
  src = src.replace(step4Start, step4Lenient);
}

// Close the else block before STEP 5
const step5Marker = `// =========================================================================
      // STEP 5: 用戶確認所有首幀
      // =========================================================================`;

if (src.includes(step5Marker) && !src.includes("} // end strict STEP 4 else")) {
  src = src.replace(
    step5Marker,
    `} // end strict STEP 4 else (Lenient already auto-passed)

      // =========================================================================
      // STEP 5: 用戶確認所有首幀
      // =========================================================================`
  );
}

// ---------------------------------------------------------------------------
// 2) In STEP 6: when video ready, if !strictWorkflowLock skip review API
// ---------------------------------------------------------------------------
const soft = `✅ 影片已就緒，正在進行 AI 影片品質與鏡頭運動審核`;
if (src.includes(soft)) {
  src = src.replace(
    /setFullAutoLogs\(prev => \[\.\.\.prev, `\[鏡頭 \$\{i \+ 1\}\] ✅ 影片已就緒，正在進行 AI 影片品質與鏡頭運動審核\.\.\.`\]\);/,
    `setFullAutoLogs(prev => [...prev, \`[鏡頭 \${i + 1}] ✅ 影片已就緒，正在進行 AI 影片品質與鏡頭運動審核...\`]);

              // Lenient: skip video review entirely
              if (!strictWorkflowLock) {
                setFullAutoLogs(prev => [...prev, \`🔓 [鏡頭 \${i + 1}] 嚴格鎖關閉：跳過影片審查，直接通過。\`]);
                updateActiveProject((prev) => ({
                  scenes: prev.scenes.map(s => s.id === scene.id ? {
                    ...s,
                    step6VideoReviewScore: 100,
                    step6VideoReviewText: "（Lenient 模式）已跳過影片審查，直接通過。",
                    step6Passed: true,
                    workflowStep: 6
                  } : s)
                }));
                try {
                  const curList = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
                  const updatedList = curList.map(p => p.id === activeProjectId ? {
                    ...p,
                    scenes: p.scenes.map(s => s.id === scene.id ? {
                      ...s,
                      step6VideoReviewScore: 100,
                      step6VideoReviewText: "（Lenient 模式）已跳過影片審查，直接通過。",
                      step6Passed: true,
                      workflowStep: 6
                    } : s)
                  } : p);
                  localStorage.setItem("toonflow_projects", JSON.stringify(updatedList));
                  localStorage.setItem("toonflow_last_sync_timestamp", Date.now().toString());
                } catch(e) {}
                videoSuccess = true;
                continue;
              }`
  );
} else {
  console.warn("[fix_lenient_skip_reviews] video review inject point not found — STEP 4 skip still applied");
}

// ---------------------------------------------------------------------------
// 3) Update toggle toast + log to mention 5-step vs 7-step
// ---------------------------------------------------------------------------
src = src.replace(
  `showToast(newVal ? "🔒 七步嚴格工作流鎖已開啟：若未完全通過7步，將嚴格重試或暫停，絕不跳鏡！" : "🔓 七步嚴格工作流鎖已關閉：故障時將容錯並安全跳過。", "info");`,
  `showToast(newVal ? "🔒 七步嚴格工作流鎖已開啟：圖片/影片審查必過，未通過會重試或暫停。" : "🔓 嚴格鎖已關閉 (5步極速)：跳過全部圖片與影片審查，直接生成。", "info");`
);

src = src.replace(
  `\`🔒 [嚴格鎖設定狀態]：當前為 \${strictWorkflowLock ? "🔒 開啟 (Strict Lock)" : "🔓 關閉 (Lenient Mode)"}。\`,
        "🎥 正在啟動最新分鏡劇本首尾幀 7 步 Check List 大師工作流..."`,
  `\`🔒 [嚴格鎖設定狀態]：當前為 \${strictWorkflowLock ? "🔒 開啟 (Strict Lock · 7步含審查)" : "🔓 關閉 (Lenient · 5步跳過審查)"}。\`,
        strictWorkflowLock
          ? "🎥 正在啟動最新分鏡劇本首尾幀 7 步 Check List 大師工作流..."
          : "⚡ 正在啟動 5 步極速工作流（已跳過圖片/影片審查）..."`
);

// ---------------------------------------------------------------------------
// 4) Update UI help text near strict lock button
// ---------------------------------------------------------------------------
src = src.replace(
  /當前為容錯降級模式，故障或不合格時會自動安全繞過並推進。/g,
  "嚴格鎖已關閉：跳過全部圖片與影片審查，走 5 步極速流程。"
);

if (src === original) {
  console.error("[fix_lenient_skip_reviews] no changes applied");
  process.exit(1);
}

fs.writeFileSync(APP, src, "utf8");
console.log("[fix_lenient_skip_reviews] applied successfully");
