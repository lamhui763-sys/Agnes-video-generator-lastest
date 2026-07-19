# 手機用戶直接修復說明

因為你在用手機，無法跑 node 指令，請用以下最簡單方法：

## 方法一（推薦）：用 GitHub 網頁改 server.ts

1. 用手機瀏覽器打開：
   https://github.com/lamhui763-sys/Agnes-video-generator-lastest/blob/main/server.ts

2. 點右上角鉛筆圖示（Edit this file）

3. 搜尋這一行：
   `const app = express();`

4. 在它**下面**貼上以下程式碼：

```js
// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    uptime: process.uptime(),
    hasAgnesKey: !!(process.env.AGNES_API_KEY && !String(process.env.AGNES_API_KEY).includes('MY_AGNES')),
    message: 'Toonflow server is alive'
  });
});
```

5. 向下滾到最下面，填寫 commit message：`add CORS and health check`
6. 點 Commit changes

Railway 會自動重新部署。

## 方法二：測試現有後端

部署成功後，用手機瀏覽器打開：

`https://你的railway網址/api/health`

如果看到 `{"status":"ok"...}` 就代表後端正常。

## 關於「保底生成失敗: Failed to fetch」

這代表前端連不到 `/api/generate-placeholder-video`。
加上 CORS + health check 後，這個問題通常會改善。
如果仍然失敗，請把 Railway 的最新 Deployment Log 截圖給我。
