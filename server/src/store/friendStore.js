const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

function createFriendStore(dataDir) {
  const filePath = path.join(dataDir, 'friends.json');
  const friendships = new Map(); // "alice:bob" -> { userId1, userId2, since }
  const requests = new Map();    // requestId -> FriendRequest

  function _load() {
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (data.friendships) {
          Object.values(data.friendships).forEach(f => {
            friendships.set(`${f.userId1}:${f.userId2}`, f);
          });
        }
        if (data.requests) {
          Object.values(data.requests).forEach(r => {
            requests.set(r.id, r);
          });
        }
      }
    } catch (e) {
      console.error('[friendStore] Load error:', e.message);
    }
  }

  function _save() {
    try {
      const fObj = {};
      friendships.forEach((v, k) => { fObj[k] = v; });
      const rObj = {};
      requests.forEach((v, k) => { rObj[k] = v; });
      fs.writeFileSync(filePath, JSON.stringify({ friendships: fObj, requests: rObj }, null, 2));
    } catch (e) {
      console.error('[friendStore] Save error:', e.message);
    }
  }

  _load();

  function _friendshipKey(id1, id2) {
    return [id1, id2].sort().join(':');
  }

  return {
    areFriends(id1, id2) {
      return friendships.has(_friendshipKey(id1, id2));
    },

    hasPendingRequest(fromId, toId) {
      for (const r of requests.values()) {
        if (r.fromId === fromId && r.toId === toId && r.status === 'pending') return true;
      }
      return false;
    },

    createRequest(fromId, toId) {
      const req = {
        id: uuidv4(),
        fromId,
        toId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      requests.set(req.id, req);
      _save();
      return req;
    },

    getRequest(requestId) {
      return requests.get(requestId) || null;
    },

    acceptRequest(requestId) {
      const req = requests.get(requestId);
      if (!req || req.status !== 'pending') return null;
      req.status = 'accepted';
      const key = _friendshipKey(req.fromId, req.toId);
      const friendship = { userId1: req.fromId, userId2: req.toId, since: new Date().toISOString() };
      friendships.set(key, friendship);
      _save();
      return { request: req, friendship };
    },

    rejectRequest(requestId) {
      const req = requests.get(requestId);
      if (!req || req.status !== 'pending') return null;
      req.status = 'rejected';
      _save();
      return req;
    },

    getFriendsList(userId) {
      const friends = [];
      friendships.forEach(f => {
        if (f.userId1 === userId) friends.push(f.userId2);
        if (f.userId2 === userId) friends.push(f.userId1);
      });
      return friends;
    },

    getPendingRequests(userId) {
      const result = [];
      requests.forEach(r => {
        if (r.toId === userId && r.status === 'pending') result.push(r);
      });
      return result;
    },

    removeFriendship(id1, id2) {
      friendships.delete(_friendshipKey(id1, id2));
      _save();
    },
  };
}

module.exports = createFriendStore;
