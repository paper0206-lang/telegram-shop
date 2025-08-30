const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config');

// Services
const ProductService = require('./services/ProductService');
const CartService = require('./services/CartService');
const PaymentService = require('./services/PaymentService');

// Handlers
const MessageHandler = require('./handlers/MessageHandler');
const CallbackHandler = require('./handlers/CallbackHandler');

class TelegramShopBot {
  constructor() {
    this.bot = new TelegramBot(config.telegram.token, config.telegram.options);
    this.productService = new ProductService();
    this.cartService = new CartService();
    this.paymentService = new PaymentService(this.bot);
    
    this.messageHandler = new MessageHandler(this.bot, {
      productService: this.productService,
      cartService: this.cartService,
      paymentService: this.paymentService
    });
    
    this.callbackHandler = new CallbackHandler(this.bot, {
      productService: this.productService,
      cartService: this.cartService,
      paymentService: this.paymentService
    });

    this.setupHandlers();
  }

  setupHandlers() {
    // Command handlers
    this.bot.onText(/\/start/, (msg) => this.messageHandler.handleStart(msg));
    this.bot.onText(/\/help/, (msg) => this.messageHandler.handleHelp(msg));
    this.bot.onText(/\/shop/, (msg) => this.messageHandler.handleShop(msg));
    this.bot.onText(/\/cart/, (msg) => this.messageHandler.handleCart(msg));

    // Text message handlers (for search)
    this.bot.on('message', (msg) => {
      // 只处理普通文本消息，不处理命令
      if (msg.text && !msg.text.startsWith('/')) {
        this.messageHandler.handleTextMessage(msg);
      }
    });

    // Callback query handlers
    this.bot.on('callback_query', (callbackQuery) => 
      this.callbackHandler.handle(callbackQuery)
    );

    // Payment handlers
    this.bot.on('pre_checkout_query', (query) => 
      this.paymentService.handlePreCheckout(query)
    );

    this.bot.on('successful_payment', (msg) => 
      this.paymentService.handleSuccessfulPayment(msg)
    );

    // Error handling
    this.bot.on('error', (error) => {
      console.error('Bot error:', error);
    });

    this.bot.on('polling_error', (error) => {
      console.error('Polling error:', error);
    });
  }

  start() {
    console.log(`🤖 ${config.shop.name} Bot started!`);
    console.log('Bot is running and waiting for messages...');
  }
}

// Check if BOT_TOKEN is provided
if (!config.telegram.token) {
  console.error('❌ Error: BOT_TOKEN is required!');
  console.log('Please copy .env.example to .env and add your bot token.');
  process.exit(1);
}

// Start the bot
const shopBot = new TelegramShopBot();
shopBot.start();