# 🚀 Vercel 部署指南

## 📋 部署前準備

### 1. 確認檔案結構
你的專案應該包含以下檔案：
```
✅ vercel.json          # Vercel 配置
✅ api/webhook.js       # Webhook endpoint  
✅ .gitignore          # Git 忽略檔案
✅ package.json        # Node.js 依賴
✅ README.md           # 專案說明
```

### 2. 環境變數準備
你需要準備：
- `BOT_TOKEN`: 從 [@BotFather](https://t.me/BotFather) 取得的 Bot Token

## 🎯 部署步驟

### 步驟 1: 推送到 GitHub

1. **建立 GitHub 倉庫**
   - 到 GitHub 建立新的 repository
   - 記住倉庫網址 (例如: `https://github.com/你的用戶名/telegram-shop.git`)

2. **推送程式碼**
   ```bash
   cd "/Users/paper/telegram shop"
   git branch -M main
   git remote add origin https://github.com/你的用戶名/telegram-shop.git
   git push -u origin main
   ```

### 步驟 2: 部署到 Vercel

1. **登入 Vercel**
   - 前往 https://vercel.com/dashboard
   - 使用 GitHub 帳號登入

2. **建立新專案**
   - 點擊 "New Project"
   - 選擇你的 GitHub 倉庫
   - 點擊 "Import"

3. **設定環境變數**
   在 "Environment Variables" 區域設定：
   ```
   BOT_TOKEN = 你的_Bot_Token_值
   ```

4. **部署**
   - 點擊 "Deploy"
   - 等待部署完成 (通常需要 1-2 分鐘)

### 步驟 3: 設定 Webhook

1. **取得 Vercel 網址**
   部署完成後，你會取得類似這樣的網址：
   `https://your-project-name.vercel.app`

2. **更新本地環境變數**
   在你的 `.env` 檔案中設定：
   ```bash
   BOT_TOKEN=你的Bot Token
   WEBHOOK_URL=https://your-project-name.vercel.app/api/webhook
   ```

3. **設定 Webhook**
   ```bash
   cd "/Users/paper/telegram shop"
   npm run webhook:set
   ```

   你應該會看到：
   ```
   ✅ Webhook set successfully!
   📋 Webhook Info:
      URL: https://your-project-name.vercel.app/api/webhook
   ```

### 步驟 4: 測試 Bot

1. 在 Telegram 中找到你的 bot
2. 發送 `/start` 
3. 測試以下功能：
   - 瀏覽商品 (`/shop`)
   - 查看購物車 (`/cart`)
   - 商品搜尋 (直接輸入文字)
   - 圖片顯示

## ✅ 驗證清單

- [ ] Bot 回應 `/start` 指令
- [ ] 商品圖片正常顯示
- [ ] 購物車功能運作
- [ ] 搜尋功能正常
- [ ] 付款流程完整

## 🔧 常見問題

### 問題：Bot 無法回應
**解決方案：**
1. 檢查 Vercel 環境變數中的 `BOT_TOKEN` 是否正確
2. 查看 Vercel 函式日誌是否有錯誤
3. 確認 webhook 設定成功

### 問題：圖片無法顯示  
**解決方案：**
圖片已使用 Lorem Picsum 服務，應該正常顯示。如有問題請檢查網路連線。

### 問題：Webhook 設定失敗
**解決方案：**
1. 確認 Vercel 網址正確
2. 檢查 `.env` 檔案中的 `WEBHOOK_URL` 設定
3. 重新執行 `npm run webhook:set`

## 📱 使用說明

部署成功後，你的 Telegram bot 將：
- ✅ 24/7 運行在 Vercel 上
- ✅ 自動處理所有 Telegram 訊息
- ✅ 支援完整的商店功能
- ✅ 使用 Telegram Stars 付款

## 🎉 恭喜！

你的 Telegram 商店 bot 現在已經成功部署到雲端，可以隨時隨地為用戶提供服務了！

---

需要更多協助？請查看：
- [Vercel 文件](https://vercel.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- 專案的 README.md 檔案