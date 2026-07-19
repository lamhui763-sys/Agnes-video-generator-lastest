/**
 * fix_add_clear_catbox.cjs
 * 1. Add /api/clear-catbox endpoint to server.ts
 * 2. Add "清除 Catbox 檔案" button + handler in App.tsx
 * Hardened markers so button survives other prebuild fixes.
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// 1. Backend: add /api/clear-catbox
// ============================================================
const serverPath = path.join(__dirname, 'server.ts');
if (fs.existsSync(serverPath)) {
  let server = fs.readFileSync(serverPath, 'utf8');

  if (!server.includes('/api/clear-catbox')) {
    const marker = '// Serve assets folder statically';
    const idx = server.lastIndexOf(marker);
    if (idx !== -1) {
      const endpoint = `
// Clear all Catbox files that this app has uploaded (requires CATBOX_USERHASH)
app.post("/api/clear-catbox", async (req, res) => {
  try {
    const userhash = process.env.CATBOX_USERHASH || "";
    const mapping = loadCloudMapping();
    const catboxUrls = Object.keys(mapping).filter(u => u.includes("catbox.moe") || u.includes("files.catbox.moe"));

    let deleted = 0;
    let failed = 0;
    const errors: string[] = [];

    if (userhash && catboxUrls.length > 0) {
      const filenames = catboxUrls.map(u => {
        try {
          const parts = u.split("/");
          return parts[parts.length - 1].split("?")[0];
        } catch {
          return null;
        }
      }).filter(Boolean) as string[];

      const batchSize = 40;
      for (let i = 0; i < filenames.length; i += batchSize) {
        const batch = filenames.slice(i, i + batchSize);
        try {
          const form = new FormData();
          form.append("reqtype", "deletefiles");
          form.append("userhash", userhash);
          form.append("files", batch.join(" "));

          const resp = await fetch("https://catbox.moe/user/api.php", {
            method: "POST",
            body: form,
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          });
          const text = await resp.text();
          if (resp.ok && (text.includes("success") || text.includes("Files successfully deleted") || text.trim() === "")) {
            deleted += batch.length;
          } else {
            failed += batch.length;
            errors.push(text.substring(0, 120));
          }
        } catch (e: any) {
          failed += batch.length;
          errors.push(e?.message || String(e));
        }
      }
    }

    const newMapping: Record<string, string> = {};
    for (const [url, local] of Object.entries(mapping)) {
      if (!url.includes("catbox.moe") && !url.includes("files.catbox.moe")) {
        newMapping[url] = local;
      }
    }
    saveCloudMapping(newMapping);

    try {
      const assets = loadApprovedAssets();
      const kept = assets.filter(a => !(a.url && (a.url.includes("catbox.moe") || a.url.includes("files.catbox.moe"))));
      if (kept.length !== assets.length) saveApprovedAssets(kept);
    } catch (e) {}

    const msg = userhash
      ? \`已嘗試清除 \${catboxUrls.length} 個 Catbox 檔案（成功 \${deleted}，失敗 \${failed}）。本地對照表已清空。\`
      : \`未設定 CATBOX_USERHASH，無法遠端刪除。已清空本地 \${catboxUrls.length} 筆 Catbox 對照記錄。\`;

    console.log("[Clear Catbox]", msg, errors.length ? errors : "");
    res.json({
      success: true,
      total: catboxUrls.length,
      deleted,
      failed,
      message: msg,
      hasUserhash: !!userhash
    });
  } catch (err: any) {
    console.error("[Clear Catbox] Error:", err);
    res.status(500).json({ error: err?.message || "Clear Catbox failed" });
  }
});

`;
      server = server.slice(0, idx) + endpoint + server.slice(idx);
      fs.writeFileSync(serverPath, server, 'utf8');
      console.log('✅ Added /api/clear-catbox endpoint to server.ts');
    } else {
      console.log('[fix] Could not find insertion point in server.ts');
    }
  } else {
    console.log('[fix] /api/clear-catbox already present');
  }
}

// ============================================================
// 2. Frontend: add button + handler in App.tsx
// ============================================================
const appPath = path.join(__dirname, 'src', 'App.tsx');
if (fs.existsSync(appPath)) {
  let app = fs.readFileSync(appPath, 'utf8');
  let changed = false;

  // --- Handler ---
  if (!app.includes('handleClearCatbox')) {
    // Prefer insert right after handleClearAllKeyframes function ends
    const clearFnMarker = 'const handleClearAllKeyframes = () => {';
    const pos = app.indexOf(clearFnMarker);
    if (pos !== -1) {
      // Find next top-level const handle... after this function
      const after = app.indexOf('\n  const handleGenerateAllKeyframesSequentially', pos);
      const after2 = app.indexOf('\n  // One-click generate all keyframe', pos);
      const insertAt = after !== -1 ? after : after2;
      if (insertAt !== -1) {
        const handler = `
  // Clear Catbox permanent files that this app uploaded
  const handleClearCatbox = async () => {
    if (!window.confirm('確定要清除所有已上傳到 Catbox 的永久檔案嗎？此操作無法復原。')) return;
    try {
      showToast('正在清除 Catbox 檔案...', 'info');
      const res = await fetch('/api/clear-catbox', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(data.message || 'Catbox 清除完成', 'success');
      } else {
        showToast(data.error || '清除失敗', 'error');
      }
    } catch (e: any) {
      showToast('清除 Catbox 失敗: ' + (e.message || e), 'error');
    }
  };

`;
        app = app.slice(0, insertAt) + handler + app.slice(insertAt);
        changed = true;
        console.log('✅ Added handleClearCatbox handler');
      } else {
        console.log('[fix] Could not find insert point after handleClearAllKeyframes');
      }
    } else {
      console.log('[fix] handleClearAllKeyframes not found');
    }
  } else {
    console.log('[fix] handleClearCatbox already present');
  }

  // --- Button UI ---
  if (!app.includes('清除 Catbox 檔案')) {
    // Multiple possible button texts
    const markers = [
      '一鍵清除已生成 (重頭再來)',
      '一鍵清除已生成(重頭再來)',
      '再次點擊以確認清除',
    ];
    let btnPos = -1;
    for (const m of markers) {
      btnPos = app.indexOf(m);
      if (btnPos !== -1) break;
    }

    if (btnPos !== -1) {
      const btnEnd = app.indexOf('</button>', btnPos);
      if (btnEnd !== -1) {
        const insertPos = btnEnd + '</button>'.length;
        const newBtn = `
                        <button
                          onClick={handleClearCatbox}
                          className="py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] relative z-20 border bg-slate-900 border-orange-500/40 hover:bg-orange-950/20 text-orange-400"
                          title="清除本 App 已上傳到 Catbox 的永久檔案（需要設定 CATBOX_USERHASH）"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-orange-400" />
                          <span>清除 Catbox 檔案</span>
                        </button>`;
        app = app.slice(0, insertPos) + newBtn + app.slice(insertPos);
        changed = true;
        console.log('✅ Added Clear Catbox button in UI');
      }
    } else {
      console.log('[fix] Clear keyframes button text not found for UI inject');
    }
  } else {
    console.log('[fix] Clear Catbox button already in UI');
  }

  if (changed) {
    fs.writeFileSync(appPath, app, 'utf8');
    console.log('✅ App.tsx updated');
  } else {
    console.log('[fix] App.tsx: no changes needed or markers not found');
  }
}

console.log('fix_add_clear_catbox done.');
