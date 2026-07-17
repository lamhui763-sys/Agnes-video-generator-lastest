const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find the erroneous double loop closing in scenes tab
const badStr = `                        })}
                      </div>
                        );
                      })}`;
code = code.replace(badStr, `                        })}
                      </div>`);

fs.writeFileSync('src/App.tsx', code);
