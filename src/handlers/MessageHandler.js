const config = require('../../config/config');
const UIHelper = require('../utils/UIHelper');

class MessageHandler {
  constructor(bot, services) {
    this.bot = bot;
    this.productService = services.productService;
    this.cartService = services.cartService;
    this.paymentService = services.paymentService;
    this.uiHelper = new UIHelper();
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.first_name || msg.from.username || '用戶';

    const welcomeMessage = 
      `👋 歡迎 ${username}！\n\n` +
      `${config.shop.welcomeMessage}\n\n` +
      `🛍️ 使用以下指令開始購物：\n` +
      `• /shop - 瀏覽商品\n` +
      `• /cart - 查看購物車\n` +
      `• /help - 獲取幫助\n\n` +
      `💫 我們接受 Telegram Stars 支付`;

    const keyboard = this.uiHelper.createMainMenuKeyboard();

    try {
      await this.bot.sendMessage(chatId, welcomeMessage, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error('Error sending start message:', error);
    }
  }

  async handleHelp(msg) {
    const chatId = msg.chat.id;
    
    const helpMessage = 
      `📖 使用幫助\n\n` +
      `🛍️ 購物指令：\n` +
      `• /shop - 瀏覽所有商品\n` +
      `• /cart - 查看購物車\n` +
      `• /start - 回到主選單\n\n` +
      `💰 支付方式：\n` +
      `• 我們使用 Telegram Stars (⭐) 作為支付貨幣\n` +
      `• 您可以通過應用內購買獲得 Stars\n` +
      `• 支付安全由 Telegram 保障\n\n` +
      `📧 需要幫助？\n` +
      `請聯繫客服獲取支持`;

    const keyboard = this.uiHelper.createMainMenuKeyboard();

    try {
      await this.bot.sendMessage(chatId, helpMessage, {
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error sending help message:', error);
    }
  }

  async handleShop(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const products = this.productService.getAllProducts();
      
      if (products.length === 0) {
        await this.bot.sendMessage(chatId, '❌ 暫無商品可售');
        return;
      }

      const message = '🛍️ 歡迎來到我們的商店！\n\n請選擇您想要瀏覽的商品分類：';
      const keyboard = this.uiHelper.createCategoriesKeyboard(this.productService.getCategories());

      await this.bot.sendMessage(chatId, message, {
        reply_markup: keyboard
      });

      // 同時顯示精選商品
      const featuredProducts = this.productService.getFeaturedProducts();
      if (featuredProducts.length > 0) {
        const featuredMessage = '⭐ 精選商品';
        const featuredKeyboard = this.uiHelper.createProductsKeyboard(featuredProducts.slice(0, 6));
        
        await this.bot.sendMessage(chatId, featuredMessage, {
          reply_markup: featuredKeyboard
        });
      }

    } catch (error) {
      console.error('Error handling shop command:', error);
      await this.bot.sendMessage(chatId, '❌ 獲取商品訊息時出錯，請稍後重試');
    }
  }

  async handleCart(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const cartMessage = this.cartService.formatCartMessage(userId, this.productService);
      const keyboard = this.cartService.isEmpty(userId) 
        ? this.uiHelper.createMainMenuKeyboard()
        : this.uiHelper.createCartKeyboard(userId);

      await this.bot.sendMessage(chatId, cartMessage, {
        reply_markup: keyboard
      });

    } catch (error) {
      console.error('Error handling cart command:', error);
      await this.bot.sendMessage(chatId, '❌ 獲取購物車訊息時出錯，請稍後重試');
    }
  }

  async handleTextMessage(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text.toLowerCase().trim();

    // 简單的商品搜索
    if (text && text.length > 1) {
      try {
        const products = this.productService.searchProducts(text);
        
        if (products.length > 0) {
          const message = `🔍 搜索结果 "${msg.text}"：\n\n找到 ${products.length} 个相关商品`;
          const keyboard = this.uiHelper.createProductsKeyboard(products.slice(0, 10));
          
          await this.bot.sendMessage(chatId, message, {
            reply_markup: keyboard
          });
        } else {
          await this.bot.sendMessage(chatId, `❌ 沒有找到包含 "${msg.text}" 的商品\n\n請尝試其他关键词或使用 /shop 瀏覽所有商品`);
        }
      } catch (error) {
        console.error('Error handling text search:', error);
        await this.bot.sendMessage(chatId, '❌ 搜索時出錯，請稍後重試');
      }
    } else {
      // 默認回复
      await this.bot.sendMessage(chatId, '🤔 我不太明白您的意思\n\n請使用 /help 查看可用指令', {
        reply_markup: this.uiHelper.createMainMenuKeyboard()
      });
    }
  }
}

module.exports = MessageHandler;