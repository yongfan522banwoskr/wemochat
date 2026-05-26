const express = require('express');

function createUserRoutes(userService) {
  const router = express.Router();

  router.get('/search', (req, res) => {
    const { q } = req.query;
    const result = userService.search(q);
    const status = result.code === 0 ? 200 : 400;
    res.status(status).json(result);
  });

  router.get('/:id', (req, res) => {
    const result = userService.getById(req.params.id);
    const status = result.code === 0 ? 200 : 404;
    res.status(status).json(result);
  });

  return router;
}

module.exports = createUserRoutes;
