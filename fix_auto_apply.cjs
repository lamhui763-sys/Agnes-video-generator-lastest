/**
 * fix_auto_apply.cjs
 * Runs on Railway prebuild.
 */
const fs = require('fs');
const path = require('path');

console.log('[fix_auto_apply] Starting...');

function patchFile(filePath, patches) {
  if (!fs.existsSync(filePath)) {
    console.log('[fix_auto_apply] Skip (not found):', filePath);
    return false;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const p of patches) {
    const { name, find, replace, once = true } = p;
    if (typeof find === 'string') {
      if (content.includes(find)) {
        content = once ? content.replace(find, replace) : content.split(find).join(replace);
        changed = true;
        console.log('[fix_auto_apply] Applied:', name);
      } else {
        console.log('[fix_auto_apply] NOT FOUND:', name);
      }
    } else if (find instanceof RegExp) {
      // reset lastIndex
      find.lastIndex = 0;
      if (find.test(content)) {
        find.lastIndex = 0;
        content = content.replace(find, replace);
        changed = true;
        console.log('[fix_auto_apply] Applied (regex):', name);
      } else {
        console.log('[fix_auto_apply] REGEX NOT FOUND:', name);
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[fix_auto_apply] Wrote:', filePath);
  }
  return changed;
}

// ========== server.ts : CORS + health ==========
const serverPath = path.join(__dirname, 'server.ts');
patchFile(serverPath, [
  {
    name: 'CORS + Health',
    find: 'const app = express();',
    replace: `const app = express();

// ===== AUTO CORS + HEALTH =====
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), uptime: process.uptime() });
});
// ===== END AUTO CORS + HEALTH =====`
  }
]);

// ========== src/App.tsx ==========
const appPath = path.join(__dirname, 'src', 'App.tsx');

patchFile(appPath, [
  // --- Clear: wipe all media + scores + set force-restart flag ---
  {
    name: 'Expand clear to wipe all media + scores',
    find: `const resetScenes = activeProject.scenes.map(s => {
      const updated = { ...s };
      delete updated.imageUrlKeyframes;
      delete updated.videoUrlKeyframes;
      updated.isGeneratingImageKeyframes = false;
      updated.isGeneratingVideoKeyframes = false;
      delete updated.videoProgressKeyframes;
      delete updated.videoLogsKeyframes;
      delete updated.videoErrorKeyframes;
      delete updated.videoErrorCodeKeyframes;
      updated.isRetryingPolicy = false;
      updated.policyRetryCount = 0;
      updated.useFreezeAndMove = false;
      updated.useMidpointSplit = false;
      delete updated.aiReviewStatus;
      delete updated.aiReviewAlignmentCheck;
      delete updated.aiReviewLogicCheck;
      delete updated.aiReviewContinuityCheck;
      delete updated.aiReviewCritique;
      updated.isReviewing = false;
      updated.hasAutoRegeneratedReview = false;
      return updated;
    });

    updateActiveProject({
      scenes: resetScenes,
      finalVideoUrl: undefined
    });
  };`,
    replace: `const resetScenes = activeProject.scenes.map(s => {
      const updated = { ...s };
      delete updated.imageUrl;
      delete updated.imageUrlExt;
      delete updated.imageUrlKeyframes;
      delete updated.videoUrl;
      delete updated.videoUrlExt;
      delete updated.videoUrlKeyframes;
      delete updated.videoUrlLocal;
      delete updated.videoUrlExtLocal;
      delete updated.videoUrlKeyframesLocal;
      delete updated.videoTailFrame;
      updated.isGeneratingImage = false;
      updated.isGeneratingImageExt = false;
      updated.isGeneratingImageKeyframes = false;
      updated.isGeneratingVideo = false;
      updated.isGeneratingVideoExt = false;
      updated.isGeneratingVideoKeyframes = false;
      delete updated.videoProgress;
      delete updated.videoProgressExt;
      delete updated.videoProgressKeyframes;
      delete updated.videoLogs;
      delete updated.videoLogsExt;
      delete updated.videoLogsKeyframes;
      delete updated.videoError;
      delete updated.videoErrorExt;
      delete updated.videoErrorKeyframes;
      delete updated.videoErrorCode;
      delete updated.videoErrorCodeExt;
      delete updated.videoErrorCodeKeyframes;
      updated.isRetryingPolicy = false;
      updated.policyRetryCount = 0;
      updated.useFreezeAndMove = false;
      updated.useMidpointSplit = false;
      delete updated.aiReviewStatus;
      delete updated.aiReviewAlignmentCheck;
      delete updated.aiReviewLogicCheck;
      delete updated.aiReviewContinuityCheck;
      delete updated.aiReviewCritique;
      updated.isReviewing = false;
      updated.hasAutoRegeneratedReview = false;
      delete updated.step2OptimizedPrompt;
      delete updated.step2OptimizedNegative;
      delete updated.step4ImageReviewScore;
      delete updated.step4ImageReviewText;
      delete updated.step4Passed;
      delete updated.step6VideoReviewScore;
      delete updated.step6VideoReviewText;
      delete updated.step6Passed;
      delete updated.step7AdviceForNext;
      delete updated.step1PrevShotAdvice;
      delete updated.workflowStep;
      return updated;
    });

    updateActiveProject({
      scenes: resetScenes,
      finalVideoUrl: undefined
    });

    try {
      if (activeProjectId) {
        localStorage.setItem('toonflow_force_restart_' + activeProjectId, String(Date.now()));
      }
    } catch (e) {}

    if (activeProjectId) {
      fetch('/api/backup-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProjectId, scenes: [] })
      }).catch(() => {});
    }

    showToast('已清除所有已生成的相片與影片，並禁止還原舊備份。現在會真正從頭開始。', 'success');
  };`
  },

  // --- Block startup restore after clear ---
  {
    name: 'Block startup restore after clear',
    find: `// Startup / interruption recovery auto-restoration hook
  useEffect(() => {
    if (isSyncCompleted && activeProjectId) {
      console.log("[Toonflow Startup Auto-Restore] Application initialized/restarted, pulling latest physical backups from server...");
      handleRestoreFromBackup(true).catch(e => {
        console.warn("[Toonflow Auto-Restore Warning] Failed to silently restore backup assets at startup:", e);
      });
    }
  }, [isSyncCompleted, activeProjectId]);`,
    replace: `// Startup / interruption recovery auto-restoration hook
  useEffect(() => {
    if (isSyncCompleted && activeProjectId) {
      try {
        const forceFlag = localStorage.getItem('toonflow_force_restart_' + activeProjectId);
        if (forceFlag) {
          console.log('[Toonflow] Force-restart flag present, skipping auto-restore from backup.');
          return;
        }
      } catch (e) {}
      console.log("[Toonflow Startup Auto-Restore] Application initialized/restarted, pulling latest physical backups from server...");
      handleRestoreFromBackup(true).catch(e => {
        console.warn("[Toonflow Auto-Restore Warning] Failed to silently restore backup assets at startup:", e);
      });
    }
  }, [isSyncCompleted, activeProjectId]);`
  },

  // --- Block full-auto restore after clear ---
  {
    name: 'Block full-auto restore after clear',
    find: `// Retrieve approved scenes from server file backup first
    try {
      await handleRestoreFromBackup(true);
    } catch (e) {
      console.warn("Failed to auto restore backup:", e);
    }`,
    replace: `// Retrieve approved scenes from server file backup first
    try {
      const forceFlag = localStorage.getItem('toonflow_force_restart_' + activeProjectId);
      if (forceFlag) {
        setFullAutoLogs(prev => [...prev, '🔄 偵測到「重頭再來」標記：已跳過備份還原，強制從頭生成。']);
      } else {
        await handleRestoreFromBackup(true);
      }
    } catch (e) {
      console.warn("Failed to auto restore backup:", e);
    }`
  },

  // --- CRITICAL: Never skip unless BOTH real image + real video exist ---
  // Match the common skip patterns in full-auto for step 3 (image), step 4 (review), step 6 (video)
  {
    name: 'Strict image skip (step 3)',
    find: /if \(currentImgUrl\) \{\s*setFullAutoLogs\(prev => \[\.\.\.prev, `\[鏡頭 \$\{i \+ 1\}\] ➡️ 偵測到已有首幀影像，自動跳過影像生成。`\]\);\s*continue;\s*\}/g,
    replace: `if (currentImgUrl && typeof currentImgUrl === 'string' && currentImgUrl.length > 20 && !currentImgUrl.includes('placeholder') && !currentImgUrl.includes('unsplash.com/photo-1618005182384')) {
          setFullAutoLogs(prev => [...prev, \`[鏡頭 \${i + 1}] ➡️ 偵測到已有首幀影像，自動跳過影像生成。\`]);
          continue;
        }`
  },
  {
    name: 'Strict step4 skip',
    find: /if \(freshSCheck\.step4Passed && freshSCheck\.step4ImageReviewScore >= 60\) \{\s*setFullAutoLogs\(prev => \[\.\.\.prev, `\[鏡頭 \$\{i \+ 1\}\] ➡️ 偵測到首幀審核已通過（分數：\$\{freshSCheck\.step4ImageReviewScore\}\/100），自動跳過審核。`\]\);\s*continue;\s*\}/g,
    replace: `const _imgForStep4 = freshSCheck[imageField] || freshSCheck.imageUrl || freshSCheck.imageUrlKeyframes;
        if (freshSCheck.step4Passed && (freshSCheck.step4ImageReviewScore || 0) >= 60 && _imgForStep4 && typeof _imgForStep4 === 'string' && _imgForStep4.length > 20) {
          setFullAutoLogs(prev => [...prev, \`[鏡頭 \${i + 1}] ➡️ 偵測到首幀審核已通過（分數：\${freshSCheck.step4ImageReviewScore}/100），自動跳過審核。\`]);
          continue;
        }`
  },
  {
    name: 'Strict video skip (step 6) - require real video AND real image',
    find: /if \(freshSCheck\[videoField\] && freshSCheck\.step6Passed && freshSCheck\.step6VideoReviewScore >= 60\) \{\s*setFullAutoLogs\(prev => \[\.\.\.prev, `\[鏡頭 \$\{i \+ 1\}\] ➡️ 偵測到影片已生成且審核通過（分數：\$\{freshSCheck\.step6VideoReviewScore\}\/100），自動跳過。`\]\);\s*continue;\s*\}/g,
    replace: `const _vid = freshSCheck[videoField];
        const _img = freshSCheck[imageField] || freshSCheck.imageUrl || freshSCheck.imageUrlKeyframes;
        const _vidOk = _vid && typeof _vid === 'string' && _vid.length > 20 && !_vid.includes('placeholder') && !_vid.includes('tmpfiles.org');
        const _imgOk = _img && typeof _img === 'string' && _img.length > 20 && !_img.includes('placeholder');
        if (_vidOk && _imgOk && freshSCheck.step6Passed && (freshSCheck.step6VideoReviewScore || 0) >= 60) {
          setFullAutoLogs(prev => [...prev, \`[鏡頭 \${i + 1}] ➡️ 偵測到影片已生成且審核通過（分數：\${freshSCheck.step6VideoReviewScore}/100），自動跳過。\`]);
          continue;
        }
        // If scores say passed but media is missing, clear the stale flags and regenerate
        if ((freshSCheck.step6Passed || freshSCheck.step6VideoReviewScore) && (!_vidOk || !_imgOk)) {
          setFullAutoLogs(prev => [...prev, \`[鏡頭 \${i + 1}] ⚠️ 偵測到分數存在但相片/影片實際為空，清除舊狀態並重新生成。\`]);
          updateActiveProject((prev) => ({
            scenes: prev.scenes.map(s => s.id === scene.id ? {
              ...s,
              step6Passed: false,
              step6VideoReviewScore: undefined,
              step6VideoReviewText: undefined,
              step4Passed: _imgOk ? s.step4Passed : false,
              [videoField]: _vidOk ? s[videoField] : undefined
            } : s)
          }));
        }`
  }
]);

console.log('[fix_auto_apply] Done.');
