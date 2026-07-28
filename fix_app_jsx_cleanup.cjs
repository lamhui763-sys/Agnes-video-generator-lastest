/**
 * fix_app_jsx_cleanup.cjs
 * Runs LAST in prebuild.
 * Fixes Railway: The character "}" is not valid inside a JSX element
 * e.g. </div>  )} left after V1/V2 SequentialChainMode inject.
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

// Aggressive: after any </SequentialChainMode> ... </div> strip trailing )} if present
{
  const re = /(<\/SequentialChainMode>\s*\n?\s*<\/div>)(\s*\)\s*\})/g;
  const before = src;
  src = src.replace(re, '$1');
  if (src !== before) {
    n++;
    console.log('[jsx-cleanup] stripped )} after </SequentialChainMode></div>');
  }
}

// Exact form from build error: </div>  )}
{
  let changed = false;
  let out = '';
  let last = 0;
  const re = /<\/div>\s*\)\s*\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const windowStart = Math.max(0, m.index - 600);
    const before = src.slice(windowStart, m.index);
    if (
      before.includes('SequentialChainMode') ||
      before.includes('EXT_ONTHEFLY') ||
      before.includes('onUpdateScenes')
    ) {
      out += src.slice(last, m.index) + '</div>';
      last = m.index + m[0].length;
      changed = true;
      console.log('[jsx-cleanup] stripped dangling </div>)} near chain panel @', m.index);
    }
  }
  out += src.slice(last);
  if (changed) {
    src = out;
    n++;
  }
}

// Remove empty zero-scene conditional with nothing inside: {activeProject.scenes.length === 0 && ( )}
{
  const re2 = /\{\s*activeProject\.scenes\.length\s*===\s*0\s*&&\s*\(\s*\)\s*\}/g;
  if (re2.test(src)) {
    src = src.replace(re2, '');
    n++;
    console.log('[jsx-cleanup] removed empty zero-scene conditional');
  }
}

// Balance rough check — count { and } in scenes_ext region is hard; just write
fs.writeFileSync(appPath, src, 'utf8');
console.log('[jsx-cleanup] done, changes:', n);
