const UIHelper = require('../utils/UIHelper');

class CallbackHandler {
  constructor(bot, services) {
    this.bot = bot;
    this.productService = services.productService;
    this.cartService = services.cartService;
    this.paymentService = services.paymentService;
    this.uiHelper = new UIHelper();
  }

  async handle(callbackQuery) {
    const { data, message, from } = callbackQuery;
    const chatId = message.chat.id;
    const messageId = message.message_id;
    const userId = from.id;

    try {
      // 解析回调數据
      const [action, ...params] = data.split(':');

      switch (action) {
        case 'main_menu':
          await this.handleMainMenu(chatId, messageId);
          break;
        
        case 'category':
          await this.handleCategory(chatId, messageId, params[0]);
          break;
        
        case 'product':
          await this.handleProduct(chatId, messageId, params[0]);
          break;
        
        case 'add_cart':
          await this.handleAddToCart(chatId, messageId, userId, params[0]);
          break;
        
        case 'cart_view':
          await this.handleCartView(chatId, messageId, userId);
          break;
        
        case 'cart_item':
          await this.handleCartItem(chatId, messageId, userId, params[0]);
          break;
        
        case 'remove_item':
          await this.handleRemoveItem(chatId, messageId, userId, params[0]);
          break;
        
        case 'quantity':
          await this.handleQuantityChange(chatId, messageId, userId, params[0], params[1]);
          break;
        
        case 'checkout':
          await this.handleCheckout(chatId, messageId, userId);
          break;
        
        case 'clear_cart':
          await this.handleClearCart(chatId, messageId, userId);
          break;
        
        case 'back_to_shop':
          await this.handleBackToShop(chatId, messageId);
          break;
        
        case 'all_products':
          await this.handleAllProducts(chatId, messageId);
          break;

        default:
          await this.bot.answerCallbackQuery(callbackQuery.id, {
            text: '未知操作',
            show_alert: false
          });
          return;
      }

      // 確認回调查詢
      await this.bot.answerCallbackQuery(callbackQuery.id);

    } catch (error) {
      console.error('Error handling callback query:', error);
      await this.bot.answerCallbackQuery(callbackQuery.id, {
        text: '操作失敗，請重試',
        show_alert: true
      });
    }
  }

  async handleMainMenu(chatId, messageId) {
    const message = '🏠 主菜單\n\n選擇您想要的操作：';
    const keyboard = this.uiHelper.createMainMenuKeyboard();

    await this.bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: keyboard
    });
  }

  async handleCategory(chatId, messageId, category) {
    const products = this.productService.getProductsByCategory(category);
    const message = `📦 ${category} 分類\n\n共有 ${products.length} 件商品：`;
    const keyboard = this.uiHelper.createProductsKeyboard(products);

    await this.bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: keyboard
    });
  }

  async handleAllProducts(chatId, messageId) {
    const products = this.productService.getAllProducts();
    const message = `🛍️ 所有商品\n\n共有 ${products.length} 件商品：`;
    const keyboard = this.uiHelper.createProductsKeyboard(products);

    await this.bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: keyboard
    });
  }

  async handleProduct(chatId, messageId, productId) {
    const product = this.productService.getProductById(productId);
    
    if (!product) {
      await this.bot.editMessageText('❌ 商品未找到', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: this.uiHelper.createBackToShopKeyboard()
      });
      return;
    }

    const message = this.productService.formatProductMessage(product);
    const keyboard = this.uiHelper.createProductDetailKeyboard(product);

    try {
      // 先刪除原訊息
      await this.bot.deleteMessage(chatId, messageId);
      
      // 發送帶圖片的新訊息
      if (product.image) {
        await this.bot.sendPhoto(chatId, product.image, {
          caption: message,
          reply_markup: keyboard,
          parse_mode: 'HTML'
        });
      } else {
        // 如果沒有圖片，就發送純文字訊息
        await this.bot.sendMessage(chatId, message, {
          reply_markup: keyboard
        });
      }
    } catch (error) {
      console.error('Error sending product with photo:', error);
      // 如果圖片發送失敗，降級到純文字
      await this.bot.sendMessage(chatId, message, {
        reply_markup: keyboard
      });
    }
  }

  async handleAddToCart(chatId, messageId, userId, productId) {
    const product = this.productService.getProductById(productId);
    
    if (!product) {
      await this.bot.answerCallbackQuery(callbackQuery.id, {
        text: '商品未找到',
        show_alert: true
      });
      return;
    }

    if (product.stock <= 0) {
      await this.bot.answerCallbackQuery(callbackQuery.id, {
        text: '商品已售完',
        show_alert: true
      });
      return;
    }

    this.cartService.addItem(userId, productId, 1);
    const cartCount = this.cartService.getCartItemsCount(userId);

    // 發送確認消息
    await this.bot.sendMessage(chatId, 
      `✅ ${product.name} 已添加到購物車\n\n` +
      `🛒 購物車商品數量: ${cartCount}`
    );

    // 更新商品詳情页面，顯示已添加到購物車
    const message = this.productService.formatProductMessage(product);
    const keyboard = this.uiHelper.createProductDetailKeyboard(product, true);

    try {
      // 先刪除原訊息
      await this.bot.deleteMessage(chatId, messageId);
      
      // 重新發送帶圖片的商品詳情（顯示已添加狀態）
      if (product.image) {
        await this.bot.sendPhoto(chatId, product.image, {
          caption: message,
          reply_markup: keyboard,
          parse_mode: 'HTML'
        });
      } else {
        await this.bot.sendMessage(chatId, message, {
          reply_markup: keyboard
        });
      }
    } catch (error) {
      console.error('Error updating product after add to cart:', error);
      await this.bot.sendMessage(chatId, message, {
        reply_markup: keyboard
      });
    }
  }

  async handleCartView(chatId, messageId, userId) {
    const cartMessage = this.cartService.formatCartMessage(userId, this.productService);
    const keyboard = this.cartService.isEmpty(userId) 
      ? this.uiHelper.createMainMenuKeyboard()
      : this.uiHelper.createCartKeyboard(userId);

    await this.bot.editMessageText(cartMessage, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: keyboard
    });
  }

  async handleCartItem(chatId, messageId, userId, productId) {
    const product = this.productService.getProductById(productId);
    const cartItems = this.cartService.getCartItems(userId);
    const cartItem = cartItems.find(item => item.productId === productId);

    if (!product || !cartItem) {
      await this.bot.editMessageText('❌ 商品未找到', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: this.uiHelper.createCartKeyboard(userId)
      });
      return;
    }

    const message = 
      `${product.name}\n\n` +
      `💰 單價: ${product.price} ⭐\n` +
      `📦 數量: ${cartItem.quantity}\n` +
      `💳 小计: ${product.price * cartItem.quantity} ⭐\n\n` +
      `您可以调整數量或移除商品：`;

    const keyboard = this.uiHelper.createCartItemKeyboard(productId, cartItem.quantity, product.stock);

    await this.bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: keyboard
    });
  }

  async handleQuantityChange(chatId, messageId, userId, productId, change) {
    const product = this.productService.getProductById(productId);
    const cartItems = this.cartService.getCartItems(userId);
    const cartItem = cartItems.find(item => item.productId === productId);

    if (!product || !cartItem) {
      return;
    }

    const newQuantity = cartItem.quantity + parseInt(change);
    
    if (newQuantity <= 0) {
      this.cartService.removeItem(userId, productId);
      await this.handleCartView(chatId, messageId, userId);
      return;
    }

    if (newQuantity > product.stock) {
      await this.bot.answerCallbackQuery(callbackQuery.id, {
        text: `庫存不足，仅剩 ${product.stock} 件`,
        show_alert: true
      });
      return;
    }

    this.cartService.updateQuantity(userId, productId, newQuantity);
    
    // 重新顯示商品詳情
    await this.handleCartItem(chatId, messageId, userId, productId);
  }

  async handleRemoveItem(chatId, messageId, userId, productId) {
    this.cartService.removeItem(userId, productId);
    await this.handleCartView(chatId, messageId, userId);
  }

  async handleClearCart(chatId, messageId, userId) {
    this.cartService.clearCart(userId);
    await this.handleCartView(chatId, messageId, userId);
  }

  async handleCheckout(chatId, messageId, userId) {
    const cartItems = this.cartService.getCartItems(userId);
    
    if (cartItems.length === 0) {
      await this.bot.editMessageText('🛒 購物車是空的', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: this.uiHelper.createMainMenuKeyboard()
      });
      return;
    }

    // 驗證購物車
    const validation = this.cartService.validateCart(userId, this.productService);
    
    if (!validation.isValid) {
      const errorMessage = '❌ 購物車驗證失敗：\n\n' + validation.errors.join('\n');
      await this.bot.editMessageText(errorMessage, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: this.uiHelper.createCartKeyboard(userId)
      });
      return;
    }

    try {
      // 創建發票
      const paymentId = await this.paymentService.createInvoice(
        chatId, 
        userId, 
        cartItems, 
        this.productService
      );

      // 清空購物車（支付成功后商品就不在購物車了）
      this.cartService.clearCart(userId);

      await this.bot.editMessageText(
        '💳 支付發票已生成\n\n請点击上方的支付按钮完成付款', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: this.uiHelper.createMainMenuKeyboard()
      });

    } catch (error) {
      console.error('Checkout error:', error);
      await this.bot.editMessageText(
        '❌ 創建支付發票失敗\n\n' + error.message, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: this.uiHelper.createCartKeyboard(userId)
      });
    }
  }

  async handleBackToShop(chatId, messageId) {
    const message = '🛍️ 商店\n\n請選擇您想要瀏覽的分類：';
    const keyboard = this.uiHelper.createCategoriesKeyboard(this.productService.getCategories());

    await this.bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: keyboard
    });
  }
}

module.exports = CallbackHandler;