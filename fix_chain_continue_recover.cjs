/**
 * fix_chain_continue_recover.cjs
 *
 * SequentialChainMode 增強：
 * 1) 若已有影片鏡頭但 phase 被重置為 idle → 仍可按「接下去」
 * 2) 預覽卡顯示【小說對應】備註
 * 3) autoMode 用 ref 避免 setTimeout 閉包過期
 */
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'src/components/SequentialChainMode.tsx');
if (!fs.existsSync(file)) {
  console.log('[chain-recover] SequentialChainMode.tsx missing');
  process.exit(0);
}

let src = fs.readFileSync(file, 'utf8');
let n = 0;

if (src.includes('CHAIN_CONTINUE_RECOVER_V1')) {
  console.log('[chain-recover] already applied');
  process.exit(0);
}

// 1) autoMode prop if missing
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
  autoMode?: boolean;
}`
  );
  n++;
}

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

// 2) canContinue: also allow when last scene has videoUrl (recovery after remount)
if (src.includes("const canContinue = phase === 'waiting_continue'")) {
  src = src.replace(
    `const canContinue = phase === 'waiting_continue' && !!scenes[currentIndex]?.videoUrl;`,
    `// CHAIN_CONTINUE_RECOVER_V1: 即使 phase 被重置，只要最後一鏡有片即可接下去
  const lastIdx = Math.max(0, scenes.length - 1);
  const lastHasVideo = !!(scenes[lastIdx]?.videoUrl);
  const canContinue =
    !isBusy &&
    lastHasVideo &&
    (phase === 'waiting_continue' || phase === 'idle' || phase === 'error' || phase === 'done') &&
    scenes.length > 0;`
  );
  n++;
}

// 3) When continuing from recovered idle, use last scene index
if (src.includes('const handleContinue = async () => {') && !src.includes('CHAIN_CONTINUE_RECOVER_IDX')) {
  src = src.replace(
    `const handleContinue = async () => {
    const prevIndex = currentIndex;
    const nextIndex = prevIndex + 1;
    const prev = scenes[prevIndex];`,
    `const handleContinue = async () => {
    // CHAIN_CONTINUE_RECOVER_IDX: 接續最後一鏡，避免 remount 後 currentIndex 錯位
    const prevIndex = scenes.length > 0 ? scenes.length - 1 : currentIndex;
    const nextIndex = prevIndex + 1;
    const prev = scenes[prevIndex];
    setCurrentIndex(prevIndex);`
  );
  n++;
}

// 4) Stronger autoMode after shot 1 — use ref to avoid stale closure
if (!src.includes('autoModeRef')) {
  // Add ref after abortRef
  if (src.includes('const abortRef = useRef(false);')) {
    src = src.replace(
      'const abortRef = useRef(false);',
      `const abortRef = useRef(false);
  const autoModeRef = useRef(autoMode);
  autoModeRef.current = autoMode;
  const continueRef = useRef<() => void>(() => {});`
    );
    n++;
  }
}

// Assign continueRef after handleContinue is defined — inject before return (
 if (src.includes('const canStart =') && !src.includes('continueRef.current = handleContinue')) {
  src = src.replace(
    /const canStart = /,
    `continueRef.current = handleContinue;

  const canStart = `
  );
  n++;
}

// Replace auto setTimeouts to use continueRef + autoModeRef
if (src.includes("addLog('✅ 鏡頭 1 完成")")) {
  // Handle both patched and unpatched versions
}

// Inject auto after shot1 success more reliably
if (!src.includes('[AUTO_AFTER_SHOT1_V2]') && src.includes("鏡頭 1 完成")) {
  // Find the shot1 completion log line and ensure auto follows
  if (src.includes('[RESTORE_POINT1_AUTO]')) {
    src = src.replace(
      /\/\/ \[RESTORE_POINT1_AUTO\][\s\S]*?setTimeout\(\(\) => \{ if \(!abortRef\.current\) handleContinue\(\); \}, 2000\);/,
      `// [AUTO_AFTER_SHOT1_V2]
      if (autoModeRef.current && !abortRef.current) {
        addLog('自動化開啟：2 秒後自動接鏡頭 2…', 'info');
        setTimeout(() => { if (!abortRef.current) continueRef.current(); }, 2000);
      }`
    );
    n++;
  } else if (src.includes("addLog('✅ 鏡頭 1 完成。按「接下去」即時生成鏡頭 2', 'ok');")) {
    src = src.replace(
      `addLog('✅ 鏡頭 1 完成。按「接下去」即時生成鏡頭 2', 'ok');`,
      `addLog('✅ 鏡頭 1 完成。按「接下去」即時生成鏡頭 2', 'ok');
      // [AUTO_AFTER_SHOT1_V2]
      if (autoModeRef.current && !abortRef.current) {
        addLog('自動化開啟：2 秒後自動接鏡頭 2…', 'info');
        setTimeout(() => { if (!abortRef.current) continueRef.current(); }, 2000);
      }`
    );
    n++;
  }
}

// Auto after continue success
if (!src.includes('[AUTO_AFTER_CONTINUE_V2]') && src.includes('可繼續按「接下去」生成鏡頭')) {
  if (src.includes('[RESTORE_POINT1_AUTO_NEXT]')) {
    src = src.replace(
      /\/\/ \[RESTORE_POINT1_AUTO_NEXT\][\s\S]*?setTimeout\(\(\) => \{ if \(!abortRef\.current\) handleContinue\(\); \}, 2000\);\s*\}/,
      `// [AUTO_AFTER_CONTINUE_V2]
      const approxDone = novelText.length > 0 && (nextIndex + 1) * 350 >= novelText.length;
      if (approxDone) {
        setPhase('done');
        addLog('📖 已覆蓋小說全文進度，停止自動生成', 'ok');
      } else if (autoModeRef.current && !abortRef.current) {
        addLog('自動化：2 秒後接下一鏡…', 'info');
        setTimeout(() => { if (!abortRef.current) continueRef.current(); }, 2000);
      }`
    );
    n++;
  } else {
    src = src.replace(
      /setPhase\('waiting_continue'\);\s*addLog\(`✅ 鏡頭 \$\{nextIndex \+ 1\} 完成。可繼續按「接下去」生成鏡頭 \$\{nextIndex \+ 2\}`, 'ok'\);/,
      `setPhase('waiting_continue');
      addLog(\`✅ 鏡頭 \$\{nextIndex + 1\} 完成。可繼續按「接下去」生成鏡頭 \$\{nextIndex + 2\}`, 'ok');
      // [AUTO_AFTER_CONTINUE_V2]
      const approxDone = novelText.length > 0 && (nextIndex + 1) * 350 >= novelText.length;
      if (approxDone) {
        setPhase('done');
        addLog('📖 已覆蓋小說全文進度，停止自動生成', 'ok');
      } else if (autoModeRef.current && !abortRef.current) {
        addLog('自動化：2 秒後接下一鏡…', 'info');
        setTimeout(() => { if (!abortRef.current) continueRef.current(); }, 2000);
      }`
    );
    n++;
  }
}

// 5) novelCoverage into directorNotes on success path
if (!src.includes('【小說對應】') && src.includes("directorNotes: s.directorNotes || advice || '',")) {
  src = src.replace(
    `directorNotes: s.directorNotes || advice || '',`,
    `directorNotes: [
          s.directorNotes || advice || '',
          '【小說對應】' + (s.novelCoverage || s.novelSourceNote || ('本鏡推進故事第 ' + (shotIndex + 1) + ' 節 / 約第 ' + (shotIndex * 2 + 1) + '-' + (shotIndex * 2 + 2) + ' 段')),
        ].filter(Boolean).join('\n'),`
  );
  n++;
}

// 6) Show directorNotes / 小說對應 under each preview card title
if (!src.includes('novel-coverage-note') && src.includes('{s.title}</div>')) {
  src = src.replace(
    `<div className="px-3 py-2 text-[10px] text-slate-500 truncate">{s.title}</div>`,
    `<div className="px-3 py-2 space-y-1">
              <div className="text-[10px] text-slate-400 truncate">{s.title}</div>
              {s.directorNotes ? (
                <div className="text-[10px] text-amber-300/90 leading-snug whitespace-pre-wrap novel-coverage-note border-t border-slate-700/60 pt-1">
                  {s.directorNotes}
                </div>
              ) : null}
            </div>`
  );
  n++;
}

// 7) Header hint for autoMode
if (!src.includes('嚴格鎖=自動') && src.includes('唔需要事先拆分鏡')) {
  src = src.replace(
    `再按「接下去」時，系統從上一支影片抽出最後一幀，結合故事進度即時生成下一鏡頭，如此類推。`,
    `再按「接下去」時，系統從上一支影片抽出最後一幀，結合故事進度即時生成下一鏡頭。` +
    `{autoMode ? '【嚴格鎖=自動】每鏡完成後約 2 秒自動接下一鏡，直至故事完。' : '【手動】完成後請按「接下去」。'} 每鏡備註含【小說對應】。`
  );
  n++;
}

// Mark
src = '/* CHAIN_CONTINUE_RECOVER_V1 */\n' + src;
n++;

fs.writeFileSync(file, src, 'utf8');
console.log('[chain-recover] SequentialChainMode patched, changes:', n);
console.log('fix_chain_continue_recover done.');
