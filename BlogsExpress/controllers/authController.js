const login_get = (req, res) => {
  res.render('login', { title: 'Login', error: null });
};

const login_post = (req, res) => {
  if (req.body.password && req.body.password === process.env.ADMIN_PASSWORD) {
    res.cookie('auth', 'true', {
      signed: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    return res.redirect('/blogs');
  }

  res.status(401).render('login', { title: 'Login', error: 'Incorrect password.' });
};

const logout = (req, res) => {
  res.clearCookie('auth');
  res.redirect('/blogs');
};

module.exports = { login_get, login_post, logout };
