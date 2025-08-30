# 🛍️ Telegram Shop Bot

一個功能完整的 Telegram 商店機器人，支援 Telegram Stars 付款系統。

## 🚀 功能特色

- 📱 完整的 Telegram 商店介面
- 🛒 購物車管理系統
- 💳 Telegram Stars 付款支援
- 🖼️ 商品圖片顯示
- 🔍 商品搜尋功能
- 📦 庫存管理
- 🏷️ 分類瀏覽

## 🛠️ 部署方式

### 本地開發
1. 複製環境變數檔案：
   ```bash
   cp .env.example .env
   ```

2. 在 `.env` 中設定你的 BOT_TOKEN

3. 安裝依賴並啟動：
   ```bash
   npm install
   npm run dev
   ```

### Vercel 部署 (推薦)

1. **準備 GitHub 倉庫**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用戶名/telegram-shop.git
   git push -u origin main
   ```

2. **部署到 Vercel**
   - 前往 [Vercel Dashboard](https://vercel.com/dashboard)
   - 點擊 "New Project"
   - 導入你的 GitHub 倉庫
   - 設定環境變數：
     - `BOT_TOKEN`: 你的 Telegram Bot Token

3. **設定 Webhook**
   部署完成後，在本地執行：
   ```bash
   # 在 .env 中設定 WEBHOOK_URL=https://你的app.vercel.app/api/webhook
   npm run webhook:set
   ```

## 📋 環境變數

| 變數名 | 說明 | 範例 |
|--------|------|------|
| `BOT_TOKEN` | Telegram Bot Token | `1234567890:ABCDEFghijklmnopQRSTuvwxyz` |
| `WEBHOOK_URL` | Webhook URL (僅生產環境) | `https://your-app.vercel.app/api/webhook` |

## 项目结构

```
telegram-shop/
├── src/
│   ├── bot.js                 # 主Bot文件
│   ├── handlers/              # 消息处理器
│   │   ├── MessageHandler.js  # 命令和文本消息处理
│   │   └── CallbackHandler.js # 内联键盘回调处理
│   ├── services/              # 业务逻辑服务
│   │   ├── ProductService.js  # 商品管理服务
│   │   ├── CartService.js     # 购物车服务
│   │   └── PaymentService.js  # 支付服务
│   └── utils/                 # 工具类
│       └── UIHelper.js        # UI键盘生成工具
├── data/
│   └── products.json         # 商品数据
├── config/
│   └── config.js            # 配置文件
└── README.md
```

## 使用指南

### 用户命令

- `/start` - 开始使用，显示欢迎消息
- `/shop` - 浏览商店商品
- `/cart` - 查看购物车
- `/help` - 获取帮助信息

### 商品管理

商品数据存储在 `data/products.json` 文件中。每个商品包含：

```json
{
  "id": "1",
  "name": "商品名称",
  "description": "商品描述",
  "price": 100,
  "category": "分类名",
  "image": "图片URL",
  "stock": 50,
  "featured": true
}
```

### 支付系统

- 使用 **Telegram Stars (⭐)** 作为支付货币
- 符合Apple和Google支付政策
- 支付处理由Telegram安全保障
- 支持发票生成和支付确认

## 开发说明

### 环境变量

- `BOT_TOKEN` - Telegram Bot令牌（必需）
- `PORT` - 应用端口（可选，默认3000）

### 扩展功能

1. **数据持久化** - 可替换JSON存储为数据库
2. **用户系统** - 添加用户注册和管理
3. **订单历史** - 保存和查询历史订单
4. **管理后台** - 管理员商品和订单管理界面
5. **多语言支持** - 国际化支持

### 安全考虑

- Bot Token应保密存储
- 生产环境建议使用HTTPS
- 定期清理过期支付记录
- 验证用户输入和权限

## API参考

### Telegram Bot API

- [Bot API Documentation](https://core.telegram.org/bots/api)
- [Payments API](https://core.telegram.org/bots/payments)
- [Telegram Stars](https://core.telegram.org/bots/payments-stars)

## 故障排除

### 常见问题

1. **Bot不响应**
   - 检查Bot Token是否正确
   - 确认Bot没有被停用
   - 查看控制台错误日志

2. **支付失败**
   - 确认使用XTR货币
   - 检查商品库存
   - 验证支付金额

3. **商品不显示**
   - 检查products.json格式
   - 确认文件路径正确
   - 重启机器人

### 日志查看

```bash
# 查看实时日志
npm run dev

# 生产环境日志
npm start > app.log 2>&1
```

## 贡献

欢迎提交Issues和Pull Requests来改进这个项目！

## 许可证

MIT License

---

🤖 Made with ❤️ for Telegram