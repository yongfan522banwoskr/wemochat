const path = require('path');
const fs = require('fs');

function createUserStore(dataDir) {
  const filePath = path.join(dataDir, 'users.json');
  const cache = new Map();

  function _load() {
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (Array.isArray(data)) {
          data.forEach(u => cache.set(u.id, u));
        }
      }
    } catch (e) {
      console.error('[userStore] Load error:', e.message);
    }
  }

  function _save() {
    try {
      const arr = Array.from(cache.values());
      fs.writeFileSync(filePath, JSON.stringify(arr, null, 2));
    } catch (e) {
      console.error('[userStore] Save error:', e.message);
    }
  }

  _load();

  return {
    findById(id) {
      return cache.get(id) || null;
    },

    create(user) {
      cache.set(user.id, user);
      _save();
      return user;
    },

    search(keyword) {
      const lower = keyword.toLowerCase();
      const results = [];
      cache.forEach(u => {
        if (u.id.toLowerCase().startsWith(lower) || u.id.toLowerCase() === lower) {
          results.push({ id: u.id, displayName: u.displayName, online: u.online });
        }
      });
      return results;
    },

    updateOnline(id, online) {
      const user = cache.get(id);
      if (user) {
        user.online = online;
        _save();
      }
    },

    exists(id) {
      return cache.has(id);
    },

    getAll() {
      return Array.from(cache.values());
    },
  };
}

module.exports = createUserStore;
