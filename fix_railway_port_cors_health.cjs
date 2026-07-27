/**
 * fix_railway_port_cors_health.cjs
 *
 * Railway 部署必須：
 * 1. listen(process.env.PORT || 3000)
 * 2. CORS 允許所有來源（或至少前端 domain）
 * 3. /api/health 供健康檢查與前端探測
 */
const fs = require('fs');
const path = require('path');

const serverPath = path.join(process.cwd(), 'server.ts');
if (!fs.existsSync(serverPath)) {
  console.log('[railway-fix] server.ts missing');
  process.exit(0);
}

let src = fs.readFileSync(serverPath, 'utf8');
let changes = 0;

if (src.includes('RAILWAY_PORT_CORS_HEALTH_V1')) {
  console.log('[railway-fix] already applied');
  process.exit(0);
}

// 1) PORT
if (src.includes('const PORT = 3000')) {
  src = src.replace(
    'const PORT = 3000',
    'const PORT = Number(process.env.PORT) || 3000 // RAILWAY_PORT_CORS_HEALTH_V1'
  );
  changes++;
  console.log('[railway-fix] PORT uses process.env.PORT');
}

// 2) CORS + health right after const app = express();
if (!src.includes("Access-Control-Allow-Origin") || !src.includes('/api/health')) {
  const marker = 'const app = express();';
  const idx = src.indexOf(marker);
  if (idx !== -1) {
    const insert = `
const app = express();

// RAILWAY_PORT_CORS_HEALTH_V1 — CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health check (Railway / frontend probe)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    uptime: process.uptime(),
    port: Number(process.env.PORT) || 3000,
    hasAgnesKey: !!(process.env.AGNES_API_KEY && !String(process.env.AGNES_API_KEY).includes('MY_AGNES')),
    message: 'Toonflow server is alive',
  });
});
`;
    src = src.slice(0, idx) + insert + src.slice(idx + marker.length);
    changes++;
    console.log('[railway-fix] + CORS + /api/health');
  }
}

if (!src.includes('RAILWAY_PORT_CORS_HEALTH_V1')) {
  src = '// RAILWAY_PORT_CORS_HEALTH_V1\n' + src;
  changes++;
}

fs.writeFileSync(serverPath, src, 'utf8');
console.log('[railway-fix] server.ts written, changes:', changes);
