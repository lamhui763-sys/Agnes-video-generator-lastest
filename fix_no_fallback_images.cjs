/**
 * fix_no_fallback_images.cjs
 * 1. Backend: stop returning Unsplash/gradient fallbacks from /api/generate-image
 * 2. Frontend handleGenerateImage: do NOT write Unsplash on error
 * 3. Full-auto STEP 3: skip failed shots, circle back up to 5 rounds, then stop for manual
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// 1. Backend server.ts - remove fallback image returns
// ============================================================
const serverPath = path.join(__dirname, 'server.ts');
if (fs.existsSync(serverPath)) {
  let server = fs.readFileSync(serverPath, 'utf8');
  let changed = false;

  // Replace the final Nano Banana / Unsplash fallback in generate-image
  // Pattern 1: return res.json({ imageUrl: fallbackUrl, isAgnesImage: false, message: "繪圖引擎忙碌中...
  const fallbackReturn1 = /return res\.json\(\{\s*imageUrl:\s*fallbackUrl,\s*isAgnesImage:\s*false,\s*message:\s*`繪圖引擎忙碌中[^`]*`\s*\}\);/g;
  if (fallbackReturn1.test(server)) {
    server = server.replace(fallbackReturn1, `throw new Error("所有繪圖引擎均失敗，拒絕使用保底圖片。請稍後重試或手動上傳。");`);
    changed = true;
    console.log('✅ Removed Nano Banana fallback return #1');
  }

  // Pattern 2: the catch-block final return with fallbackUrl
  const fallbackReturn2 = /return res\.json\(\{\s*imageUrl:\s*fallbackUrl,\s*isFallback:\s*true,\s*message:\s*friendlyReason\s*\}\);/g;
  if (fallbackReturn2.test(server)) {
    server = server.replace(fallbackReturn2, `return res.status(500).json({ error: friendlyReason || "繪圖失敗，已禁用保底圖片", noFallback: true });`);
    changed = true;
    console.log('✅ Removed catch-block fallback return');
  }

  // Also in ensurePublicCdnUrl - the Unsplash fallbacks when CDN fails
  // Leave those for now as they only affect CDN upload path, not primary generation.

  if (changed) {
    fs.writeFileSync(serverPath, server, 'utf8');
    console.log('✅ server.ts updated');
  } else {
    console.log('[fix] server.ts: patterns not found or already fixed');
  }
}

// ============================================================
// 2. Frontend App.tsx
// ============================================================
const appPath = path.join(__dirname, 'src', 'App.tsx');
if (fs.existsSync(appPath)) {
  let app = fs.readFileSync(appPath, 'utf8');
  let changed = false;

  // 2a. Remove Unsplash fallback in handleGenerateImage catch block
  const unsplashFallback = `[imageField]: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",`;
  if (app.includes(unsplashFallback)) {
    app = app.replace(unsplashFallback, `// NO FALLBACK IMAGE - leave empty so user can retry
              [imageField]: "",`);
    changed = true;
    console.log('✅ Removed Unsplash fallback from handleGenerateImage');
  }

  // Also the resolution message that mentions Unsplash
  const resolutionMsg = 'resolution: "⚠️ 已自動調用 Unsplash 高清備用插圖（降級容錯），確保故事完整度並順利推進工作流！"';
  if (app.includes(resolutionMsg)) {
    app = app.replace(resolutionMsg, 'resolution: "⚠️ 繪圖失敗，已拒絕保底圖片。請手動重試或上傳。"');
    changed = true;
  }

  // 2b. Rewrite STEP 3 image generation loop in handleFullAutoVideoProduction
  // Find the STEP 3 section and replace the while-retry-per-scene logic with skip-circle
  const step3Marker = '// =========================================================================\n      // STEP 3: 生成所有鏡頭的首幀（只生成首幀）\n      // =========================================================================';
  const step3Idx = app.indexOf(step3Marker);
  if (step3Idx !== -1) {
    // Find the end of STEP 3 (start of STEP 4)
    const step4Marker = '// =========================================================================\n      // STEP 4: AI 檢查所有首幀是否合理';
    const step4Idx = app.indexOf(step4Marker, step3Idx);
    if (step4Idx !== -1) {
      const newStep3 = `// =========================================================================
      // STEP 3: 生成所有鏡頭的首幀（跳過失敗→循環重試，最多 5 輪，絕不使用保底圖）
      // =========================================================================
      setFullAutoLogs(prev => [...prev, "🎬 [步驟 3] 正在生成所有分鏡的首幀（失敗會先跳過，成功後回頭重試，最多 5 輪循環）..."]);

      const isRealImageUrl = (url: string | undefined | null) => {
        if (!url || typeof url !== 'string') return false;
        if (url.includes('unsplash.com')) return false;
        if (url.includes('gradient') || url.includes('placeholder')) return false;
        // Reject obvious non-content or empty
        if (url.trim() === '' || url === 'null' || url === 'undefined') return false;
        return url.startsWith('http') || url.startsWith('/assets/') || url.startsWith('data:image');
      };

      const maxImageRounds = 5;
      let imageRound = 0;
      let allImagesReady = false;

      while (!allImagesReady && imageRound < maxImageRounds) {
        imageRound++;
        setFullAutoLogs(prev => [...prev, \\`🔄 [步驟 3] 第 \\\{imageRound\}/\\${maxImageRounds\} 輪：掃描並生成尚未成功的首幀...\\`]);

        let anyAttemptedThisRound = false;
        let successThisRound = 0;

        for (let i = 0; i < currentScenes.length; i++) {
          const scene = currentScenes[i];

          const curProjListCheck = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
          const curProjCheck = curProjListCheck.find(p => p.id === activeProjectId);
          const freshSCheck = curProjCheck?.scenes.find(s => s.id === scene.id) || scene;
          const currentImgUrl = freshSCheck[imageField] || freshSCheck.imageUrl || freshSCheck.imageUrlKeyframes;

          if (isRealImageUrl(currentImgUrl)) {
            continue; // already has real image
          }

          anyAttemptedThisRound = true;
          updateActiveProject((prev) => ({
            scenes: prev.scenes.map(s => s.id === scene.id ? { ...s, workflowStep: 3 } : s)
          }));

          setFullAutoLogs(prev => [...prev, \\`🎨 [鏡頭 \\\{i + 1\}] 第 \\\{imageRound\} 輪：正在繪製首幀...\\`]);
          try {
            await handleGenerateImage(scene.id, 'agnes');

            await new Promise<void>((resolve, reject) => {
              let checkCount = 0;
              const checkImgInterval = setInterval(() => {
                checkCount++;
                const curProjList = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
                const curProj = curProjList.find(p => p.id === activeProjectId);
                const freshS = curProj?.scenes.find(s => s.id === scene.id);

                if (freshS) {
                  if (!freshS[isGenImgField]) {
                    clearInterval(checkImgInterval);
                    if (isRealImageUrl(freshS[imageField] || freshS.imageUrl || freshS.imageUrlKeyframes)) {
                      resolve();
                    } else {
                      reject(new Error("影像生成完畢，但未回傳有效真實首幀網址（已禁用保底圖）。"));
                    }
                  }
                }
                if (checkCount > 180) {
                  clearInterval(checkImgInterval);
                  reject(new Error("影像生成超時。"));
                }
              }, 1500);
            });

            successThisRound++;
            setFullAutoLogs(prev => [...prev, \\`[鏡頭 \\\{i + 1\}] ✅ 成功繪製真實首幀！\\`]);
          } catch (imgErr: any) {
            // Skip this shot for now, continue to next
            setFullAutoLogs(prev => [...prev, \\`[鏡頭 \\\{i + 1\}] ⚠️ 首幀失敗，先跳過，稍後再試：\\${imgErr.message || imgErr\}\\`]);
            // Ensure loading state is cleared and no fallback written
            updateActiveProject((prev) => ({
              scenes: prev.scenes.map(s => s.id === scene.id ? {
                ...s,
                isGeneratingImage: false,
                isGeneratingImageExt: false,
                isGeneratingImageKeyframes: false
              } : s)
            }));
            // small pause then continue to next scene
            await new Promise(r => setTimeout(r, 800));
          }
        }

        // Check if all have real images
        const finalCheckList = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
        const finalProj = finalCheckList.find(p => p.id === activeProjectId);
        const scenesNow = finalProj?.scenes || currentScenes;
        const missing = scenesNow.filter(s => {
          const u = s[imageField] || s.imageUrl || s.imageUrlKeyframes;
          return !isRealImageUrl(u);
        });

        if (missing.length === 0) {
          allImagesReady = true;
          setFullAutoLogs(prev => [...prev, "✅ [步驟 3] 所有鏡頭真實首幀已全部生成成功！"]);
        } else if (!anyAttemptedThisRound) {
          // Nothing was attempted (all already good or stuck) — break
          break;
        } else {
          setFullAutoLogs(prev => [...prev, \\`📋 [步驟 3] 第 \\\{imageRound\} 輪結束：本輪成功 \\\{successThisRound\} 個，尚餘 \\\{missing.length\} 個未成功，將進入下一輪...\\`]);
          await new Promise(r => setTimeout(r, 1500));
        }
      }

      if (!allImagesReady) {
        // Final count
        const finalCheckList2 = JSON.parse(localStorage.getItem("toonflow_projects") || "[]") as Project[];
        const finalProj2 = finalCheckList2.find(p => p.id === activeProjectId);
        const scenesNow2 = finalProj2?.scenes || currentScenes;
        const stillMissing = scenesNow2
          .map((s, idx) => ({ s, idx }))
          .filter(({ s }) => !isRealImageUrl(s[imageField] || s.imageUrl || s.imageUrlKeyframes));

        setFullAutoLogs(prev => [
          ...prev,
          \\`🛑 [步驟 3] 已完成 \\\{maxImageRounds\} 輪循環，仍有 \\\{stillMissing.length\} 個鏡頭未能生成真實相片。\\`,
          "💡 已停止自動推進，請手動為失敗鏡頭重新生成或上傳圖片，完成後再繼續下一步。",
          ...stillMissing.map(({ idx }) => \\`   - 鏡頭 \\\{idx + 1\} 仍缺真實首幀\\`)
        ]);
        showToast(\\[步驟 3\] \\\{stillMissing.length\} 個鏡頭首幀失敗，已停低交人手處理\\`, "error");
        throw new Error("IMAGE_GEN_MANUAL_INTERVENTION");
      }

      `;

      app = app.slice(0, step3Idx) + newStep3 + app.slice(step4Idx);
      changed = true;
      console.log('✅ Replaced STEP 3 with skip-retry-circle strategy');
    }
  }

  // 2c. Also fix the non-strict fallback Unsplash in the OLD step3 (if any residual)
  const residualFallback = 'const fallbackImg = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";';
  if (app.includes(residualFallback)) {
    // Replace the whole fallback block with a throw
    app = app.replace(
      /setFullAutoLogs\(prev => \[\.\.\.prev, `⚠️ \[容錯降級\] 鏡頭 \$\{i \+ 1\} 首幀失敗，自動套用極速安全備用畫面\.\.\.`\]\);[\s\S]*?imageSuccess = true;/,
      `setFullAutoLogs(prev => [...prev, \\[鏡頭 \\\{i + 1\}\] 首幀失敗且已達上限，不使用保底圖，交人手處理。\\]);
                throw new Error("IMAGE_GEN_MANUAL_INTERVENTION");`
    );
    changed = true;
    console.log('✅ Removed residual Unsplash fallback in auto-produce');
  }

  // 2d. Handle the new error type in the outer catch of full auto
  if (!app.includes('IMAGE_GEN_MANUAL_INTERVENTION')) {
    // already in the new step3 throw; ensure outer catch treats it softly
    const outerCatch = 'if (err.message === "STRICT_LOCK_PAUSE") {';
    if (app.includes(outerCatch)) {
      app = app.replace(
        outerCatch,
        `if (err.message === "IMAGE_GEN_MANUAL_INTERVENTION") {
        setFullAutoLogs(prev => [
          ...prev,
          "🛑 首幀生成已達 5 輪上限，部分鏡頭仍未成功。已停低，請手動補齊真實相片後再繼續。"
        ]);
      } else if (err.message === "STRICT_LOCK_PAUSE") {`
      );
      changed = true;
      console.log('✅ Added IMAGE_GEN_MANUAL_INTERVENTION handling');
    }
  }

  if (changed) {
    fs.writeFileSync(appPath, app, 'utf8');
    console.log('✅ App.tsx updated');
  } else {
    console.log('[fix] App.tsx: no changes applied');
  }
}

console.log('fix_no_fallback_images done.');
