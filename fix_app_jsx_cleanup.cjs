/**
 * fix_app_jsx_cleanup.cjs
 * Runs LAST in prebuild.
 * Fixes: The character "}" is not valid inside a JSX element
 * caused by V1/V2 leave-behind: </div>  )}
 */
const fs = require('fs');
const path = require('path');

const appPath = path.join(process.cwd(), 'src', 'App.tsx');
if (!fs.existsSync(appPath)) {
  console.log('[jsx-cleanup] App.tsx missing');
  process.exit(0);
}

let src = fs.readFileSync(appPath, 'utf8');
let n = 0;

// Pattern 1: </div>  )}  leftover from zero-scene conditional after ALWAYS panel inject
const p1 = /(<\/SequentialChainMode>\s*<\/div>)\s*\)\s*\}/g;
if (p1.test(src)) {
  src = src.replace(p1, '$1');
  n++;
  console.log('[jsx-cleanup] removed dangling )} after SequentialChainMode');
}

// Pattern 2: broader — </div>   )} on same line after onUpdateScenes close
const p2 = /(onUpdateScenes=\{\(newScenes\)\s*=>\s*\{[\s\S]*?\}\s*\}\s*\/>\s*<\/div>)\s*\)\s*\}/g;
if (p2.test(src)) {
  src = src.replace(p2, '$1');
  n++;
  console.log('[jsx-cleanup] removed dangling )} after onUpdateScenes block');
}

// Pattern 3: exact error form from Railway log: </div>  )}
const p3 = /(<\/div>)\s+\)\}/g;
// Only strip if nearby SequentialChainMode / EXT_ONTHEFLY
{
  let out = '';
  let i = 0;
  const re = /<\/div>\s+\)\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const before = src.slice(Math.max(0, m.index - 400), m.index);
    if (before.includes('SequentialChainMode') || before.includes('EXT_ONTHEFLY')) {
      out += src.slice(i, m.index) + '</div>';
      i = m.index + m[0].length;
      n++;
      console.log('[jsx-cleanup] stripped </div> )} near SequentialChainMode at', m.index);
    }
  }
  out += src.slice(i);
  if (n > 0) src = out;
}

// Pattern 4: double closing from clean-v3 + v2 both injecting
// Ensure EXT_ONTHEFLY_START_V2 panel exists; if V1 zero-only still present, leave as is

// Pattern 5: fix orphaned `{activeProject.scenes.length === 0 && (` without closer near SequentialChainMode
// If we have open conditional but replaced body, remove the open too
const orphanOpen = /\{activeProject\.scenes\.length === 0 && \(\s*<\/div>/;
if (orphanOpen.test(src)) {
  src = src.replace(orphanOpen, '</div>');
  n++;
  console.log('[jsx-cleanup] removed orphan zero-scene open');
}

fs.writeFileSync(appPath, src, 'utf8');
console.log('[jsx-cleanup] done, changes:', n);
