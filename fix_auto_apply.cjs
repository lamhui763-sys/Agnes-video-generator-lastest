/**
 * fix_auto_apply.cjs
 * Automatically runs during Railway/npm build (via prebuild).
 * Directly patches server.ts and src/App.tsx so user does nothing.
 */
const fs = require('fs');
const path = require('path');

console.log('[fix_auto_apply] Starting automatic source patches...');

function patchFile(filePath, patches) {
  if (!fs.existsSync(filePath)) {
    console.log(`[fix_auto_apply] Skip (not found): ${filePath}`);
    return false;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { name, find, replace, once = true } of patches) {
    if (typeof find === 'string') {
      if (content.includes(find)) {
        content = once ? content.replace(find, replace) : content.split(find).join(replace);
        changed = true;
        console.log(`[fix_auto_apply] Applied: ${name}`);
      }
    } else if (find instanceof RegExp) {
      if (find.test(content)) {
        content = content.replace(find, replace);
        changed = true;
        console.log(`[fix_auto_apply] Applied (regex): ${name}`);
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[fix_auto_apply] Wrote changes to ${filePath}`);
  } else {
    console.log(`[fix_auto_apply] No matching patches for ${filePath}`);
  }
  return changed;
}

// ========== 1. server.ts : CORS + /api/health ==========
const serverPath = path.join(__dirname, 'server.ts');
patchFile(serverPath, [
  {
    name: 'CORS + Health Check',
    find: 'const app = express();\nconst PORT = 3000;',
    replace: `const app = express();
const PORT = 3000;

// ===== AUTO-ADDED: CORS + Health Check =====
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    uptime: process.uptime(),
    hasAgnesKey: !!(process.env.AGNES_API_KEY && !String(process.env.AGNES_API_KEY).includes('MY_AGNES')),
    message: 'Toonflow server is alive'
  });
});
// ===== END AUTO-ADDED =====`
  }
]);

// ========== 2. src/App.tsx : full clear + stricter skip ==========
const appPath = path.join(__dirname, 'src', 'App.tsx');

// Stronger clear function: wipe ALL generated media + scores + server backup
const oldClearFn = `const handleClearAllKeyframes = () => {
    if (!activeProject) return;
    
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      // Auto-reset after 4 seconds if they don't confirm
      setTimeout(() => {
        setIsConfirmingClear(false);
      }, 4000);
      return;
    }

    // Reset confirmation state
    setIsConfirmingClear(false);

    // Reset pipeline state
    setFullAutoProgress(\"0%\");
    setFullAutoLogs([]);
    setFinalStitchedVideoUrl(null);

    const resetScenes = activeProject.scenes.map(s => {
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
  };`;

const newClearFn = `const handleClearAllKeyframes = () => {
    if (!activeProject) return;
    
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      // Auto-reset after 4 seconds if they don't confirm
      setTimeout(() => {
        setIsConfirmingClear(false);
      }, 4000);
      return;
    }

    // Reset confirmation state
    setIsConfirmingClear(false);

    // Reset pipeline state
    setFullAutoProgress(\"0%\");
    setFullAutoLogs([]);
    setFinalStitchedVideoUrl(null);

    // ===== TRUE START-OVER: wipe ALL generated assets, scores, and flags =====
    const resetScenes = activeProject.scenes.map(s => {
      const updated = { ...s };
      // Clear ALL image variants
      updated.imageUrl = \"\";
      updated.imageUrlExt = \"\";
      updated.imageUrlKeyframes = \"\";
      delete updated.imageUrl;
      delete updated.imageUrlExt;
      delete updated.imageUrlKeyframes;
      // Clear ALL video variants
      updated.videoUrl = \"\";
      updated.videoUrlExt = \"\";
      updated.videoUrlKeyframes = \"\";
      delete updated.videoUrl;
      delete updated.videoUrlExt;
      delete updated.videoUrlKeyframes;
      delete updated.videoUrlLocal;
      delete updated.videoUrlExtLocal;
      delete updated.videoUrlKeyframesLocal;
      delete updated.videoTailFrame;
      // Clear generation flags
      updated.isGeneratingImage = false;
      updated.isGeneratingImageExt = false;
      updated.isGeneratingImageKeyframes = false;
      updated.isGeneratingVideo = false;
      updated.isGeneratingVideoExt = false;
      updated.isGeneratingVideoKeyframes = false;
      // Clear progress / logs / errors
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
      // Clear policy / review state
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
      // Clear 7-step workflow scores so skip logic will NOT fire
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

    // Also wipe the server-side interrupted backup so restore cannot pull old media back
    if (activeProjectId) {
      fetch(\"/api/backup-assets\", {
        method: \"POST\",
        headers: { \"Content-Type\": \"application/json\" },
        body: JSON.stringify({ projectId: activeProjectId, scenes: [] })
      }).catch(() => {});
    }

    showToast(\"已清除所有已生成的相片與影片，並清空伺服器備份。現在會真正從頭開始。\", \"success\");
  };`;

patchFile(appPath, [
  {
    name: 'True start-over clear (wipe all media + scores + backup)',
    find: oldClearFn,
    replace: newClearFn
  },
  {
    name: 'Stricter video skip condition',
    find: /if\s*\(\s*freshSCheck\[videoField\]\s*&&\s*freshSCheck\.step6Passed\s*&&\s*freshSCheck\.step6VideoReviewScore\s*>=\s*60\s*\)/g,
    replace: `if (
          freshSCheck[videoField] &&
          typeof freshSCheck[videoField] === 'string' &&
          freshSCheck[videoField].length > 15 &&
          !freshSCheck[videoField].includes('placeholder') &&
          !freshSCheck[videoField].includes('tmpfiles.org') &&
          freshSCheck.step6Passed &&
          (freshSCheck.step6VideoReviewScore || 0) >= 60
        )`
  },
  {
    name: 'Better Failed to fetch message',
    find: 'Failed to fetch',
    replace: 'Failed to fetch（後端連線失敗：請檢查 Railway 部署狀態或 /api/health）',
    once: false
  }
]);

console.log('[fix_auto_apply] Done.');
