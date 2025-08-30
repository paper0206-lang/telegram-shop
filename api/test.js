module.exports = async (req, res) => {
  return res.status(200).json({
    message: 'API is working!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
};