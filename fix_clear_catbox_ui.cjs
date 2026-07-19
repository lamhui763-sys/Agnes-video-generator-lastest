/**
 * fix_clear_catbox_ui.cjs
 * Injects a "清除 Catbox 檔案" button into App.tsx near existing clear controls.
 */
const fs = require('fs');
const path = require('path');

const appPath = path.join(process.cwd(), 'src', 'App.tsx');
if (!fs.existsSync(appPath)) {
  console.log('[fix_clear_catbox_ui] src/App.tsx not found, skip');
  process.exit(0);
}

let src = fs.readFileSync(appPath, 'utf8');

if (src.includes('clear-catbox') || src.includes('清除 Catbox')) {
  console.log('[fix_clear_catbox_ui] Already has clear catbox UI');
  process.exit(0);
}

// 1. Add handler function if not present
const handlerCode = `
  const handleClearCatbox = async () => {
    if (!window.confirm('確定要刪除本 App 上傳到 Catbox 帳戶的檔案嗎？此操作無法還原。')) return;
    try {
      const res = await fetch('/api/clear-catbox', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '清除失敗');
        return;
      }
      alert(data.message || `已清除 ${data.deleted || 0} 個檔案`);
    } catch (e: any) {
      alert('清除請求失敗: ' + (e?.message || e));
    }
  };
`;

// Try to insert handler near other handlers
if (!src.includes('handleClearCatbox')) {
  const anchors = [
    'const handleClearAllKeyframes',
    'const handleClearAll',
    'function handleClearAll',
    'const resetWorkflow',
  ];
  let inserted = false;
  for (const a of anchors) {
    if (src.includes(a)) {
      src = src.replace(a, handlerCode + '\n  ' + a);
      inserted = true;
      console.log('[fix_clear_catbox_ui] Inserted handler near', a);
      break;
    }
  }
  if (!inserted) {
    // insert near first const/function after component start as last resort
    const m = src.match(/const \w+ = async \(\) => \{/);
    if (m) {
      src = src.replace(m[0], handlerCode + '\n  ' + m[0]);
      console.log('[fix_clear_catbox_ui] Inserted handler near first async const');
    } else {
      console.log('[fix_clear_catbox_ui] Could not find place for handler');
    }
  }
}

// 2. Add button near existing clear button text
const buttonJsx = `
              <button
                type="button"
                onClick={handleClearCatbox}
                className="px-3 py-1.5 text-xs rounded-lg bg-orange-600/80 hover:bg-orange-500 text-white border border-orange-400/40"
                title="刪除本 App 上傳到 Catbox 帳戶的檔案（永久）"
              >
                清除 Catbox 檔案
              </button>`;

const uiAnchors = [
  '一鍵清除已生成',
  '重頭再來',
  '清除已生成',
];

let uiInserted = false;
for (const text of uiAnchors) {
  if (src.includes(text)) {
    // Find the closing </button> after this text and insert after that button
    const idx = src.indexOf(text);
    if (idx !== -1) {
      const after = src.indexOf('</button>', idx);
      if (after !== -1) {
        const insertAt = after + '</button>'.length;
        src = src.slice(0, insertAt) + buttonJsx + src.slice(insertAt);
        uiInserted = true;
        console.log('[fix_clear_catbox_ui] Inserted button after', text);
        break;
      }
    }
  }
}

if (!uiInserted) {
  console.log('[fix_clear_catbox_ui] Could not find clear button text to attach UI; backend API still available at POST /api/clear-catbox');
}

fs.writeFileSync(appPath, src, 'utf8');
console.log('[fix_clear_catbox_ui] Done');
