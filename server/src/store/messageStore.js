const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

function createMessageStore(dataDir) {
  const filePath = path.join(dataDir, 'messages.json');
  const cache = new Map(); // key: "alice:bob" (sorted ids)

  function _conversationKey(id1, id2) {
    return [id1, id2].sort().join(':');
  }

  function _load() {
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (data && typeof data === 'object') {
          Object.keys(data).forEach(key => {
            cache.set(key, data[key]);
          });
        }
      }
    } catch (e) {
      console.error('[messageStore] Load error:', e.message);
    }
  }

  function _save() {
    try {
      const obj = {};
      cache.forEach((msgs, key) => { obj[key] = msgs; });
      fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
    } catch (e) {
      console.error('[messageStore] Save error:', e.message);
    }
  }

  _load();

  return {
    save(senderId, receiverId, content) {
      const key = _conversationKey(senderId, receiverId);
      if (!cache.has(key)) cache.set(key, []);
      const msg = {
        id: uuidv4(),
        senderId,
        receiverId,
        content,
        timestamp: new Date().toISOString(),
        read: false,
      };
      cache.get(key).push(msg);
      _save();
      return msg;
    },

    getConversation(userId1, userId2, limit = 50, before = null) {
      const key = _conversationKey(userId1, userId2);
      const msgs = cache.get(key) || [];
      let filtered = msgs;
      if (before) {
        filtered = msgs.filter(m => m.timestamp < before);
      }
      return filtered.slice(-limit);
    },

    markRead(byUserId, messageIds) {
      // Walk all conversations to find and mark messages as read
      cache.forEach((msgs) => {
        msgs.forEach(m => {
          if (messageIds.includes(m.id) && m.receiverId === byUserId) {
            m.read = true;
          }
        });
      });
      _save();
    },

    getUnreadCount(userId, friendId) {
      const key = _conversationKey(userId, friendId);
      const msgs = cache.get(key) || [];
      return msgs.filter(m => m.receiverId === userId && !m.read).length;
    },
  };
}

module.exports = createMessageStore;
