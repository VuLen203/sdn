/**
 * Middleware: Check if authenticated user has admin role
 * Must be used after authMiddleware
 */
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res
    .status(403)
    .json({ message: 'Access denied. Admin role required.' });
};

module.exports = adminMiddleware;
