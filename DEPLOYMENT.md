# 🚀 Telegram商店部署指南

## 準備工作

### 1. 獲取Bot資訊
- ✅ 您已有Telegram API
- ✅ 您已有商店Bot
- 🔄 需要提供Bot Token

### 2. 需要的資訊
請提供以下資訊給我：
```
BOT_TOKEN=你的完整bot_token
BOT_USERNAME=@你的bot用戶名（可選）
```

## 部署步驟

### 步驟1：配置環境變量
```bash
# 編輯 .env 文件
BOT_TOKEN=你的實際token
PORT=3000
```

### 步驟2：啟動商店
```bash
# 安裝依賴（已完成）
npm install

# 啟動商店
npm start
```

### 步驟3：測試基本功能
1. 在Telegram中找到您的Bot
2. 發送 `/start` 命令
3. 測試以下功能：
   - ✅ 瀏覽商品分類
   - ✅ 查看商品詳情
   - ✅ 添加到購物車
   - ✅ 查看購物車
   - ✅ 搜索商品

### 步驟4：測試支付功能
1. 添加商品到購物車
2. 點擊"立即結帳"
3. 確認生成Telegram Stars發票
4. ⚠️ **注意：實際支付需要真實的Bot Token**

## 當前商店狀態

### ✅ 已完成功能
- 15種商品已上架
- 2個商品分類（保健品、男性健康）
- 完整購物車系統
- Telegram Stars支付集成
- 商品搜索功能
- 庫存管理

### 🔧 需要配置
- Bot Token（必需）
- 可選：自定義商店名稱
- 可選：調整商品價格

## 常見問題

### Q: Bot不回應怎麼辦？
A: 檢查：
1. Bot Token是否正確
2. Bot是否被啟用
3. 控制台是否有錯誤信息

### Q: 支付功能不工作？
A: 確認：
1. 使用真實的Bot Token（測試token不支持支付）
2. Bot已啟用支付功能
3. 檢查Telegram Stars是否可用

### Q: 如何修改商品？
A: 編輯 `data/products.json` 文件，然後重啟商店

## 下一步
1. 提供您的Bot Token
2. 我將幫您配置並啟動
3. 進行完整功能測試