// Vercel serverless entry point. server.js exports the Express app without
// calling .listen() when required (rather than run directly), and Express
// apps are themselves valid (req, res) request handlers.
module.exports = require('../server.js');
