require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is required');
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.error('❌ WEBHOOK_URL is required');
  console.log('Example: https://your-app.vercel.app/api/webhook');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

async function setWebhook() {
  try {
    console.log('🔄 Setting webhook...');
    console.log(`📡 Webhook URL: ${WEBHOOK_URL}`);
    
    // Set webhook
    const result = await bot.setWebHook(WEBHOOK_URL);
    
    if (result) {
      console.log('✅ Webhook set successfully!');
      
      // Get webhook info
      const info = await bot.getWebHookInfo();
      console.log('📋 Webhook Info:');
      console.log(`   URL: ${info.url}`);
      console.log(`   Has custom certificate: ${info.has_custom_certificate}`);
      console.log(`   Pending updates: ${info.pending_update_count}`);
      
      if (info.last_error_date) {
        console.log(`   Last error: ${new Date(info.last_error_date * 1000)}`);
        console.log(`   Last error message: ${info.last_error_message}`);
      }
      
    } else {
      console.log('❌ Failed to set webhook');
    }
    
  } catch (error) {
    console.error('❌ Error setting webhook:', error);
  }
}

// Also provide a function to delete webhook (useful for development)
async function deleteWebhook() {
  try {
    console.log('🔄 Deleting webhook...');
    const result = await bot.deleteWebHook();
    
    if (result) {
      console.log('✅ Webhook deleted successfully!');
    } else {
      console.log('❌ Failed to delete webhook');
    }
  } catch (error) {
    console.error('❌ Error deleting webhook:', error);
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'delete') {
  deleteWebhook();
} else {
  setWebhook();
}