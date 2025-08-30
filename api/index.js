module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    message: 'Telegram Shop Bot API is running!',
    status: 'ok',
    endpoints: [
      '/api/webhook - Telegram webhook',
      '/api/test - Test endpoint'
    ]
  });
};