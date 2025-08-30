const TelegramBot = require('node-telegram-bot-api');

// Services
const ProductService = require('../src/services/ProductService');
const CartService = require('../src/services/CartService');
const PaymentService = require('../src/services/PaymentService');

// Handlers
const MessageHandler = require('../src/handlers/MessageHandler');
const CallbackHandler = require('../src/handlers/CallbackHandler');

// Initialize services
let bot, productService, cartService, paymentService, messageHandler, callbackHandler;

function initializeBot() {
  if (!bot) {
    const token = process.env.BOT_TOKEN;
    
    if (!token) {
      throw new Error('BOT_TOKEN is required');
    }

    // Create bot instance without polling
    bot = new TelegramBot(token, { polling: false });
    
    // Initialize services
    productService = new ProductService();
    cartService = new CartService();
    paymentService = new PaymentService(bot);
    
    // Initialize handlers
    messageHandler = new MessageHandler(bot, {
      productService,
      cartService,
      paymentService
    });
    
    callbackHandler = new CallbackHandler(bot, {
      productService,
      cartService,
      paymentService
    });

    console.log('✅ Bot initialized for webhook mode');
  }
  
  return { bot, messageHandler, callbackHandler, paymentService };
}

module.exports = async (req, res) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { bot, messageHandler, callbackHandler, paymentService } = initializeBot();
    const update = req.body;

    console.log('📨 Received webhook update:', JSON.stringify(update, null, 2));

    // Handle different types of updates
    if (update.message) {
      const msg = update.message;
      
      // Handle commands
      if (msg.text) {
        if (msg.text.startsWith('/start')) {
          await messageHandler.handleStart(msg);
        } else if (msg.text.startsWith('/help')) {
          await messageHandler.handleHelp(msg);
        } else if (msg.text.startsWith('/shop')) {
          await messageHandler.handleShop(msg);
        } else if (msg.text.startsWith('/cart')) {
          await messageHandler.handleCart(msg);
        } else if (!msg.text.startsWith('/')) {
          // Handle text search
          await messageHandler.handleTextMessage(msg);
        }
      }
    }

    // Handle callback queries (inline button presses)
    if (update.callback_query) {
      await callbackHandler.handle(update.callback_query);
    }

    // Handle payment updates
    if (update.pre_checkout_query) {
      await paymentService.handlePreCheckout(update.pre_checkout_query);
    }

    if (update.message && update.message.successful_payment) {
      await paymentService.handleSuccessfulPayment(update.message);
    }

    // Respond with 200 OK
    res.status(200).json({ ok: true });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};