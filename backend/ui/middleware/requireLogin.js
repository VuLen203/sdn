function requireLogin(req, res, next) {
  if (req.session && req.session.token) return next();
  return res.redirect('/login');
}

module.exports = requireLogin;
