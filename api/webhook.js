module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        method: req.method 
      });
    }

    const BOT_TOKEN = process.env.BOT_TOKEN;
    
    if (!BOT_TOKEN) {
      return res.status(500).json({ 
        error: 'BOT_TOKEN not configured',
        message: 'Environment variable BOT_TOKEN is required' 
      });
    }

    const update = req.body;
    console.log('📨 Received webhook update:', JSON.stringify(update, null, 2));

    // For now, just acknowledge the webhook
    // TODO: Add full bot functionality back
    return res.status(200).json({ 
      ok: true,
      message: 'Webhook received',
      updateType: update.message ? 'message' : 
                  update.callback_query ? 'callback_query' : 
                  update.pre_checkout_query ? 'pre_checkout_query' : 'unknown'
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};