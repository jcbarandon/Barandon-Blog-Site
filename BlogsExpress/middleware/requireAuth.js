module.exports = function requireAuth(req, res, next) {
  if (req.signedCookies && req.signedCookies.auth === 'true') {
    return next();
  }
  res.redirect('/login');
};
