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
  },
  // fallback if line endings differ
  {
    name: 'CORS + Health Check (CRLF fallback)',
    find: 'const app = express();\r\nconst PORT = 3000;',
    replace: `const app = express();\r\nconst PORT = 3000;\r\n\r\n// ===== AUTO-ADDED: CORS + Health Check =====\r\napp.use((req, res, next) => {\r\n  res.setHeader('Access-Control-Allow-Origin', '*');\r\n  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');\r\n  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');\r\n  if (req.method === 'OPTIONS') return res.sendStatus(200);\r\n  next();\r\n});\r\n\r\napp.get('/api/health', (req, res) => {\r\n  res.json({\r\n    status: 'ok',\r\n    time: new Date().toISOString(),\r\n    uptime: process.uptime(),\r\n    hasAgnesKey: !!(process.env.AGNES_API_KEY && !String(process.env.AGNES_API_KEY).includes('MY_AGNES')),\r\n    message: 'Toonflow server is alive'\r\n  });\r\n});\r\n// ===== END AUTO-ADDED =====`
  }
]);

// ========== 2. src/App.tsx : stricter skip logic + better error messages ==========
const appPath = path.join(__dirname, 'src', 'App.tsx');
patchFile(appPath, [
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
  },
  {
    name: 'Better 保底生成失敗 message',
    find: '保底生成失敗: Failed to fetch',
    replace: '保底生成失敗: Failed to fetch（後端 /api/generate-placeholder-video 無法連線）'
  }
]);

console.log('[fix_auto_apply] Done.');
