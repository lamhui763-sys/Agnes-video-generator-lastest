/**
 * fix_auto_apply.cjs
 * Runs automatically during Railway build (prebuild).
 * Uses small unique anchors so patches actually apply.
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
      if (find.test(content)) {
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

// ========== server.ts ==========
const serverPath = path.join(__dirname, 'server.ts');
patchFile(serverPath, [
  {
    name: 'CORS + Health (anchor)',
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

// 1) Make clear wipe EVERYTHING (use small unique anchor inside the function)
patchFile(appPath, [
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
      // WIPE ALL images
      delete updated.imageUrl;
      delete updated.imageUrlExt;
      delete updated.imageUrlKeyframes;
      // WIPE ALL videos
      delete updated.videoUrl;
      delete updated.videoUrlExt;
      delete updated.videoUrlKeyframes;
      delete updated.videoUrlLocal;
      delete updated.videoUrlExtLocal;
      delete updated.videoUrlKeyframesLocal;
      delete updated.videoTailFrame;
      // generation flags
      updated.isGeneratingImage = false;
      updated.isGeneratingImageExt = false;
      updated.isGeneratingImageKeyframes = false;
      updated.isGeneratingVideo = false;
      updated.isGeneratingVideoExt = false;
      updated.isGeneratingVideoKeyframes = false;
      // progress / logs / errors
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
      // policy / review
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
      // 7-step scores so skip will NOT fire
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

    // Mark force-restart so next full-auto will NOT restore backup
    try {
      if (activeProjectId) {
        localStorage.setItem('toonflow_force_restart_' + activeProjectId, String(Date.now()));
      }
    } catch (e) {}

    // Wipe server backup
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

  // 2) Block auto-restore at startup if user just cleared
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
      // If user pressed clear, do NOT restore old media
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

  // 3) Block restore at beginning of full-auto if user cleared
  {
    name: 'Block full-auto restore after clear',
    find: `// Retrieve approved scenes from server file backup first
    try {
      await handleRestoreFromBackup(true);
    } catch (e) {
      console.warn("Failed to auto restore backup:", e);
    }`,
    replace: `// Retrieve approved scenes from server file backup first
    // BUT skip if user just pressed clear (force restart)
    try {
      const forceFlag = localStorage.getItem('toonflow_force_restart_' + activeProjectId);
      if (forceFlag) {
        setFullAutoLogs(prev => [...prev, '🔄 偵測到「重頭再來」標記：已跳過備份還原，強制從頭生成。']);
        // Keep the flag until this full-auto finishes, then clear it at the end if you want
      } else {
        await handleRestoreFromBackup(true);
      }
    } catch (e) {
      console.warn("Failed to auto restore backup:", e);
    }`
  },

  // 4) Stricter skip so empty/invalid urls are not treated as done
  {
    name: 'Stricter video skip',
    find: /if\s*\(\s*freshSCheck\[videoField\]\s*&&\s*freshSCheck\.step6Passed\s*&&\s*freshSCheck\.step6VideoReviewScore\s*>=\s*60\s*\)/g,
    replace: `if (
          freshSCheck[videoField] &&
          typeof freshSCheck[videoField] === 'string' &&
          freshSCheck[videoField].length > 20 &&
          !String(freshSCheck[videoField]).includes('placeholder') &&
          !String(freshSCheck[videoField]).includes('tmpfiles.org') &&
          freshSCheck.step6Passed &&
          (freshSCheck.step6VideoReviewScore || 0) >= 60
        )`
  }
]);

console.log('[fix_auto_apply] Done.');
