require('dotenv').config();

const config = {
  telegram: {
    token: process.env.BOT_TOKEN,
    options: {
      polling: true
    }
  },
  app: {
    port: process.env.PORT || 3000
  },
  shop: {
    name: '🛍️ Telegram 商店',
    currency: 'XTR', // Telegram Stars
    welcomeMessage: '歡迎來到我們的 Telegram 商店！您可以使用 Telegram Stars 購買商品。',
    maxProducts: 50
  }
};

module.exports = config;