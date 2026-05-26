function createAuthMiddleware(sessionStore) {
  return function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 1, message: '未登录' });
    }
    const token = authHeader.substring(7);
    const userId = sessionStore.validate(token);
    if (!userId) {
      return res.status(401).json({ code: 1, message: '登录已过期，请重新登录' });
    }
    req.userId = userId;
    req.token = token;
    next();
  };
}

module.exports = createAuthMiddleware;
