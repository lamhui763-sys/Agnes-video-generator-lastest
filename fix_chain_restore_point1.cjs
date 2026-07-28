/**
 * fix_chain_restore_point1.cjs
 * 還原點 1：增強 SequentialChainMode
 * - autoMode prop（對應嚴格鎖附近自動開關）
 * - 每鏡 novelCoverage 備註
 * - 鏡頭1 後角色鎖定
 * - 自動化時連續接鏡直到故事完結
 */
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'src/components/SequentialChainMode.tsx');
if (!fs.existsSync(file)) {
  console.log('[restore-point1] SequentialChainMode.tsx missing — skip');
  process.exit(0);
}

let src = fs.readFileSync(file, 'utf8');
let n = 0;

// 1) Add autoMode + onUpdateCharacters to props interface if missing
if (!src.includes('autoMode?:')) {
  src = src.replace(
    `interface SequentialChainModeProps {
  project: Project;
  onUpdateScenes: (scenes: Scene[]) => void;
  artStyle?: string;
  cameraMotion?: string;
}`,
    `interface SequentialChainModeProps {
  project: Project;
  onUpdateScenes: (scenes: Scene[]) => void;
  onUpdateCharacters?: (characters: Character[]) => void;
  artStyle?: string;
  cameraMotion?: string;
  /** true = 自動化至小說完結；false = 手動「接下去」 */
  autoMode?: boolean;
}`
  );
  n++;
}

// 2) Destructure autoMode
if (!src.includes('autoMode = false')) {
  src = src.replace(
    `export const SequentialChainMode: React.FC<SequentialChainModeProps> = ({
  project,
  onUpdateScenes,
  artStyle,
  cameraMotion,
}) => {`,
    `export const SequentialChainMode: React.FC<SequentialChainModeProps> = ({
  project,
  onUpdateScenes,
  onUpdateCharacters,
  artStyle,
  cameraMotion,
  autoMode = false,
}) => {`
  );
  n++;
}

// 3) After directorNotes assignment in success path, inject novelCoverage into directorNotes
if (!src.includes('novelCoverage') && src.includes('directorNotes: s.directorNotes')) {
  src = src.replace(
    `directorNotes: s.directorNotes || advice || '',`,
    `directorNotes: [s.directorNotes || advice || '', '【小說對應】' + (s.novelCoverage || s.novelSourceNote || ('本鏡對應故事進度第 ' + (shotIndex + 1) + ' 節'))].filter(Boolean).join('\n'),`
  );
  n++;
}

// 4) After setPhase('waiting_continue') in handleStart — auto continue hook
if (!src.includes('[RESTORE_POINT1_AUTO]') && src.includes("addLog('✅ 鏡頭 1 完成。按「接下去」即時生成鏡頭 2'")) {
  src = src.replace(
    `setPhase('waiting_continue');
      addLog('✅ 鏡頭 1 完成。按「接下去」即時生成鏡頭 2', 'ok');`,
    `setPhase('waiting_continue');
      addLog('✅ 鏡頭 1 完成。按「接下去」即時生成鏡頭 2', 'ok');
      // [RESTORE_POINT1_AUTO]
      if (autoMode && !abortRef.current) {
        addLog('自動化開啟：2 秒後自動接鏡頭 2…', 'info');
        setTimeout(() => { if (!abortRef.current) handleContinue(); }, 2000);
      }`
  );
  n++;
}

// 5) After continue success waiting_continue — auto next
if (!src.includes('[RESTORE_POINT1_AUTO_NEXT]') && src.includes('可繼續按「接下去」生成鏡頭')) {
  src = src.replace(
    /setPhase\('waiting_continue'\);\s*addLog\(`✅ 鏡頭 \$\{nextIndex \+ 1\} 完成。可繼續按「接下去」生成鏡頭 \$\{nextIndex \+ 2\}`, 'ok'\);/,
    `setPhase('waiting_continue');
      addLog(\`✅ 鏡頭 ${nextIndex + 1} 完成。可繼續按「接下去」生成鏡頭 ${nextIndex + 2}`, 'ok');
      // [RESTORE_POINT1_AUTO_NEXT]
      const approxDone = novelText.length > 0 && (nextIndex + 1) * 350 >= novelText.length;
      if (approxDone) {
        setPhase('done');
        addLog('📖 已覆蓋小說全文進度，停止自動生成', 'ok');
      } else if (autoMode && !abortRef.current) {
        addLog('自動化：2 秒後接下一鏡…', 'info');
        setTimeout(() => { if (!abortRef.current) handleContinue(); }, 2000);
      }`
  );
  n++;
}

// 6) UI hint for autoMode in header description
if (!src.includes('自動化已開') && src.includes('唔需要事先拆分鏡')) {
  src = src.replace(
    `再按「接下去」時，系統從上一支影片抽出最後一幀，結合故事進度即時生成下一鏡頭，如此類推。`,
    `再按「接下去」時，系統從上一支影片抽出最後一幀，結合故事進度即時生成下一鏡頭。` + 
    `{autoMode ? '【自動化已開】每鏡完成後自動接下一鏡，直至小說完結。' : '【手動】完成後按接下去。'} 每鏡導演註記含【小說對應】段落。`
  );
  n++;
}

// 7) Hide continue button text note when auto — optional soft
if (!src.includes('autoMode && (') && src.includes('接下去（鏡頭')) {
  // leave button visible for safety
}

fs.writeFileSync(file, src, 'utf8');
console.log('[restore-point1] SequentialChainMode patched, changes:', n);

// Also soft-patch server generate-next-scene prompt for novelCoverage if present
const serverPath = path.join(process.cwd(), 'server.ts');
if (fs.existsSync(serverPath)) {
  let srv = fs.readFileSync(serverPath, 'utf8');
  if (srv.includes('generate-next-scene') && !srv.includes('novelCoverage')) {
    srv = srv.replace(
      `"directorNotes": "brief Traditional Chinese notes",
  "durationSeconds": 8
}`,
      `"directorNotes": "brief Traditional Chinese notes",
  "novelCoverage": "Traditional Chinese note: which novel paragraphs/section this shot covers (e.g. 第1-2段：凌風在辦公室)",
  "storyComplete": false,
  "durationSeconds": 8
}`
    );
    // PORT fix
    if (srv.includes('const PORT = 3000;') && !srv.includes('process.env.PORT')) {
      srv = srv.replace('const PORT = 3000;', 'const PORT = Number(process.env.PORT) || 3000;');
    }
    fs.writeFileSync(serverPath, srv, 'utf8');
    console.log('[restore-point1] server.ts generate-next-scene + PORT patched');
  }
}
