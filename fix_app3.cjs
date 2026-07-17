const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(`                      </div>
                        );
                      })}
                        {activeProject.scenes.length === 0 && (`, `                      </div>
                        {activeProject.scenes.length === 0 && (`);

fs.writeFileSync('src/App.tsx', code);
