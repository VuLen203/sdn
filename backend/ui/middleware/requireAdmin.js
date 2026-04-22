function requireAdmin(req, res, next) {
  const role = req.session?.user?.role;
  if (role === 'admin') return next();
  return res.status(403).send('Access denied. Admin role required.');
}

module.exports = requireAdmin;
