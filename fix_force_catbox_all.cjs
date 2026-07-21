/**
 * fix_force_catbox_all.cjs
 * Force every generated image AND video to upload to the user's Catbox account
 * (permanent storage via CATBOX_USERHASH). Removes FreeImageHost preference
 * so all assets appear under catbox.moe/user/view.
 */
const fs = require('fs');
const path = require('path');

const serverPath = path.join(process.cwd(), 'server.ts');
if (!fs.existsSync(serverPath)) {
  console.log('[fix_force_catbox] server.ts not found, skip');
  process.exit(0);
}

let src = fs.readFileSync(serverPath, 'utf8');
let changed = false;

// ---------- 1. Harden uploadToCatbox with userhash + longer timeout ----------
const oldUploadToCatbox = `async function uploadToCatbox(localPath: string): Promise<string> {
  try {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(localPath);
    let mimeType = "application/octet-stream";
    if (localPath.endsWith(".mp4")) mimeType = "video/mp4";
    else if (localPath.endsWith(".png")) mimeType = "image/png";
    else if (localPath.endsWith(".jpg") || localPath.endsWith(".jpeg")) mimeType = "image/jpeg";
    else if (localPath.endsWith(".gif")) mimeType = "image/gif";
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", blob, path.basename(localPath));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(\`Catbox upload did not succeed\`);
    }
    const fileUrl = await response.text();
    if (fileUrl && fileUrl.startsWith("http")) {
      const finalUrl = fileUrl.trim();
      console.log(\`[Toonflow CDN] File successfully uploaded to Catbox: \${finalUrl}\`);
      return finalUrl;
    }
    throw new Error(\`Invalid response from Catbox\`);
  } catch (err: any) {
    console.log(\`[Toonflow CDN] Upload to Catbox bypassed\`);
    throw err;
  }
}`;

const newUploadToCatbox = `async function uploadToCatbox(localPath: string): Promise<string> {
  try {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(localPath);
    let mimeType = "application/octet-stream";
    if (localPath.endsWith(".mp4")) mimeType = "video/mp4";
    else if (localPath.endsWith(".png")) mimeType = "image/png";
    else if (localPath.endsWith(".jpg") || localPath.endsWith(".jpeg")) mimeType = "image/jpeg";
    else if (localPath.endsWith(".gif")) mimeType = "image/gif";
    else if (localPath.endsWith(".webp")) mimeType = "image/webp";
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", blob, path.basename(localPath));

    // Permanent account upload when CATBOX_USERHASH is set in Railway env
    const userhash = (process.env.CATBOX_USERHASH || process.env.CATBOX_HASH || "").trim();
    if (userhash) {
      formData.append("userhash", userhash);
      console.log("[Toonflow CDN] Using Catbox ACCOUNT upload (PERMANENT storage under your account)");
    } else {
      console.log("[Toonflow CDN] WARNING: CATBOX_USERHASH not set — anonymous upload (will NOT appear in your Catbox View Files)");
    }

    const controller = new AbortController();
    // Videos can be large; 90s timeout
    const timeoutId = setTimeout(() => controller.abort(), 90000);
    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(\`Catbox upload did not succeed (HTTP \${response.status})\`);
    }
    const fileUrl = await response.text();
    if (fileUrl && fileUrl.startsWith("http")) {
      const finalUrl = fileUrl.trim();
      console.log(\`[Toonflow CDN] File successfully uploaded to Catbox\${userhash ? " (PERMANENT under account)" : ""}: \${finalUrl}\`);
      return finalUrl;
    }
    throw new Error(\`Invalid response from Catbox: \${String(fileUrl).slice(0, 200)}\`);
  } catch (err: any) {
    console.log(\`[Toonflow CDN] Upload to Catbox failed: \${err?.message || err}\`);
    throw err;
  }
}`;

if (src.includes(oldUploadToCatbox)) {
  src = src.replace(oldUploadToCatbox, newUploadToCatbox);
  changed = true;
  console.log('[fix_force_catbox] Replaced full uploadToCatbox with userhash + 90s version');
} else if (!src.includes('CATBOX_USERHASH') || !src.includes('90000')) {
  // Anchor-based patch
  const anchor = 'formData.append("reqtype", "fileupload");\n    formData.append("fileToUpload", blob, path.basename(localPath));';
  if (src.includes(anchor) && !src.includes('CATBOX_USERHASH')) {
    const replacement = `formData.append("reqtype", "fileupload");\n    formData.append("fileToUpload", blob, path.basename(localPath));\n\n    // Permanent account upload when CATBOX_USERHASH is set in Railway env\n    const userhash = (process.env.CATBOX_USERHASH || process.env.CATBOX_HASH || "").trim();\n    if (userhash) {\n      formData.append("userhash", userhash);\n      console.log("[Toonflow CDN] Using Catbox ACCOUNT upload (PERMANENT storage under your account)");\n    } else {\n      console.log("[Toonflow CDN] WARNING: CATBOX_USERHASH not set — anonymous upload (will NOT appear in your Catbox View Files)");\n    }`;
    src = src.replace(anchor, replacement);
    // Bump timeout
    src = src.replace(
      /const timeoutId = setTimeout\(\(\) => controller\.abort\(\), 15000\);\s*const response = await fetch\("https:\/\/catbox\.moe\/user\/api\.php"/,
      'const timeoutId = setTimeout(() => controller.abort(), 90000);\n    const response = await fetch("https://catbox.moe/user/api.php"'
    );
    changed = true;
    console.log('[fix_force_catbox] Patched uploadToCatbox via anchor (userhash + 90s timeout)');
  } else if (src.includes('CATBOX_USERHASH')) {
    console.log('[fix_force_catbox] uploadToCatbox already has userhash support');
  } else {
    console.log('[fix_force_catbox] Could not locate uploadToCatbox to patch');
  }
} else {
  console.log('[fix_force_catbox] uploadToCatbox already hardened');
}

// ---------- 2. Force uploadToPublicCDN to ALWAYS prefer Catbox (so images also go to account) ----------
const oldPublicCDN = `async function uploadToPublicCDN(localPath: string, activeTaskLogs?: string[]): Promise<string> {
  const ext = path.extname(localPath).toLowerCase();
  const isImage = [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext);

  if (isImage) {
    try {
      if (activeTaskLogs) activeTaskLogs.push(\\[SYSTEM] 正在上傳圖片至 FreeImageHost 影像 CDN (推薦影像端)...\\`);
      const freeimageUrl = await uploadToFreeImageHost(localPath);
      return freeimageUrl;
    } catch (freeimageErr: any) {
      console.log(\\[Toonflow CDN] FreeImageHost upload bypassed, trying backup: \\${freeimageErr.message}\\`);
      if (activeTaskLogs) activeTaskLogs.push(\\[SYSTEM] FreeImageHost 上傳失敗，正在切換至備用雲端儲存...\\`);
      return await uploadFileToCatbox(localPath);
    }
  } else {
    // For videos and other file types, use the robust uploader
    if (activeTaskLogs) activeTaskLogs.push(\\[SYSTEM] 正在上傳影片/檔案至雲端永久儲存空間...\\`);
    return await uploadFileToCatbox(localPath);
  }
}`;

// Simpler unique string match for the function body start
const publicCdnStart = 'async function uploadToPublicCDN(localPath: string, activeTaskLogs?: string[]): Promise<string> {';
const publicCdnIdx = src.indexOf(publicCdnStart);

if (publicCdnIdx !== -1 && !src.includes('FORCE_CATBOX_ALL_V1')) {
  // Find the end of the function (next async function or matching brace)
  let braceCount = 0;
  let endIdx = -1;
  let started = false;
  for (let i = publicCdnIdx; i < src.length; i++) {
    if (src[i] === '{') { braceCount++; started = true; }
    else if (src[i] === '}') {
      braceCount--;
      if (started && braceCount === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }

  if (endIdx !== -1) {
    const newPublicCDN = `async function uploadToPublicCDN(localPath: string, activeTaskLogs?: string[]): Promise<string> {
  // FORCE_CATBOX_ALL_V1 — always prefer permanent Catbox account storage
  const userhash = (process.env.CATBOX_USERHASH || process.env.CATBOX_HASH || "").trim();
  if (userhash) {
    if (activeTaskLogs) activeTaskLogs.push(\\[SYSTEM] 強制上傳至 Catbox 永久帳戶儲存空間...\\`);
    try {
      return await uploadFileToCatbox(localPath);
    } catch (catboxErr: any) {
      console.log(\\[Toonflow CDN] Catbox preferred path failed, falling back: \\${catboxErr?.message || catboxErr}\\`);
      if (activeTaskLogs) activeTaskLogs.push(\\[SYSTEM] Catbox 上傳失敗，切換備用...\\`);
    }
  }

  const ext = path.extname(localPath).toLowerCase();
  const isImage = [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext);

  if (isImage) {
    try {
      if (activeTaskLogs) activeTaskLogs.push(\\[SYSTEM] 正在上傳圖片至 FreeImageHost 影像 CDN (推薦影像端)...\\`);
      const freeimageUrl = await uploadToFreeImageHost(localPath);
      return freeimageUrl;
    } catch (freeimageErr: any) {
      console.log(\\[Toonflow CDN] FreeImageHost upload bypassed, trying backup: \\${freeimageErr.message}\\`);
      if (activeTaskLogs) activeTaskLogs.push(\\[SYSTEM] FreeImageHost 上傳失敗，正在切換至備用雲端儲存...\\`);
      return await uploadFileToCatbox(localPath);
    }
  } else {
    // For videos and other file types, use the robust uploader
    if (activeTaskLogs) activeTaskLogs.push(\\[SYSTEM] 正在上傳影片/檔案至雲端永久儲存空間...\\`);
    return await uploadFileToCatbox(localPath);
  }
}`;

    src = src.slice(0, publicCdnIdx) + newPublicCDN + src.slice(endIdx);
    changed = true;
    console.log('[fix_force_catbox] Replaced uploadToPublicCDN to FORCE Catbox when userhash present');
  } else {
    console.log('[fix_force_catbox] Could not find end of uploadToPublicCDN');
  }
} else if (src.includes('FORCE_CATBOX_ALL_V1')) {
  console.log('[fix_force_catbox] uploadToPublicCDN already forced to Catbox');
} else {
  console.log('[fix_force_catbox] uploadToPublicCDN not found');
}

if (changed) {
  fs.writeFileSync(serverPath, src, 'utf8');
  console.log('[fix_force_catbox] server.ts written');
} else {
  console.log('[fix_force_catbox] No changes needed');
}

console.log('fix_force_catbox_all done.');
