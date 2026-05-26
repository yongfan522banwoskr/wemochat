const express = require('express');

function createAuthRoutes(authService) {
  const router = express.Router();

  router.post('/register', (req, res) => {
    const { id } = req.body;
    const result = authService.register(id);
    const status = result.code === 0 ? 200 : 400;
    res.status(status).json(result);
  });

  router.post('/login', (req, res) => {
    const { id, mnemonicWords } = req.body;
    const result = authService.login(id, mnemonicWords);
    const status = result.code === 0 ? 200 : 400;
    res.status(status).json(result);
  });

  router.post('/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authService.logout(authHeader.substring(7));
    }
    res.json({ code: 0, message: 'ok' });
  });

  router.get('/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 1, message: '未登录' });
    }
    const result = authService.getMe(authHeader.substring(7));
    const status = result.code === 0 ? 200 : 400;
    res.status(status).json(result);
  });

  return router;
}

module.exports = createAuthRoutes;
