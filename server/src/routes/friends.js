const express = require('express');

function createFriendRoutes(friendService, messageService) {
  const router = express.Router();

  router.post('/request', (req, res) => {
    const { toId } = req.body;
    const result = friendService.sendRequest(req.userId, toId);
    const status = result.code === 0 ? 200 : 400;
    res.status(status).json(result);
  });

  router.post('/respond', (req, res) => {
    const { requestId, action } = req.body;
    const result = friendService.respondToRequest(req.userId, requestId, action);
    const status = result.code === 0 ? 200 : 400;
    res.status(status).json(result);
  });

  router.get('/list', (_req, res) => {
    const result = friendService.getFriendsList(_req.userId);
    res.json(result);
  });

  router.get('/requests', (_req, res) => {
    const result = friendService.getPendingRequests(_req.userId);
    res.json(result);
  });

  router.get('/:friendId/messages', (req, res) => {
    const { friendId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before || null;
    const result = messageService.getMessages(req.userId, friendId, limit, before);
    res.json(result);
  });

  return router;
}

module.exports = createFriendRoutes;
