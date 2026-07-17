const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Use regex to remove any floating ");" between </div> and {activeProject.scenes.length === 0
code = code.replace(/<\/div>\s*\);\s*\{activeProject\.scenes\.length === 0/g, '</div>\n                        {activeProject.scenes.length === 0');

fs.writeFileSync('src/App.tsx', code);
