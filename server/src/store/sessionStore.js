const { v4: uuidv4 } = require('uuid');

function createSessionStore() {
  // In-memory only (resets on server restart)
  const sessions = new Map();

  return {
    create(userId) {
      const token = uuidv4();
      const session = { token, userId, createdAt: new Date().toISOString() };
      sessions.set(token, session);
      return token;
    },

    validate(token) {
      const session = sessions.get(token);
      if (!session) return null;
      return session.userId;
    },

    remove(token) {
      sessions.delete(token);
    },
  };
}

module.exports = createSessionStore;
