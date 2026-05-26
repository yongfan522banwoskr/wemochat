function createChatHandler(wss, sessionStore, messageService, friendService, userService) {
  // Map<userId, WebSocket>
  const connections = new Map();

  wss.on('connection', (ws) => {
    let userId = null;

    ws.on('message', (raw) => {
      let data;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        return ws.send(JSON.stringify({ type: 'error', payload: { code: 1, message: '无效消息格式' } }));
      }

      // Handle auth
      if (data.type === 'auth') {
        const { token } = data.payload || {};
        userId = sessionStore.validate(token);
        if (!userId) {
          ws.send(JSON.stringify({ type: 'error', payload: { code: 2, message: '认证失败' } }));
          ws.close();
          return;
        }
        connections.set(userId, ws);
        ws.userId = userId;
        // Notify friends that user is online
        broadcastFriendOnlineStatus(userId, true);
        return;
      }

      // All subsequent messages require auth
      if (!userId) {
        return ws.send(JSON.stringify({ type: 'error', payload: { code: 2, message: '请先认证' } }));
      }

      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;

        case 'message.send': {
          const { to: receiverId, content } = data.payload || {};
          if (!receiverId || !content) {
            ws.send(JSON.stringify({ type: 'error', payload: { code: 1, message: '缺少参数' } }));
            break;
          }
          // Verify friendship
          const friendsResult = friendService.getFriendsList(userId);
          const isFriend = friendsResult.data?.friends?.some(f => f.id === receiverId);
          if (!isFriend) {
            ws.send(JSON.stringify({ type: 'error', payload: { code: 3, message: '你们还不是好友' } }));
            break;
          }
          const result = messageService.sendMessage(userId, receiverId, content);
          if (result.code === 0) {
            const msg = result.data.message;
            // Send to sender (confirmation)
            ws.send(JSON.stringify({ type: 'message.new', payload: { message: msg } }));
            // Send to receiver if online
            const receiverWs = connections.get(receiverId);
            if (receiverWs && receiverWs.readyState === 1) {
              receiverWs.send(JSON.stringify({ type: 'message.new', payload: { message: msg } }));
            }
          } else {
            ws.send(JSON.stringify({ type: 'error', payload: { code: 1, message: result.message } }));
          }
          break;
        }

        case 'typing': {
          const { to: receiverId, isTyping } = data.payload || {};
          const receiverWs = connections.get(receiverId);
          if (receiverWs && receiverWs.readyState === 1) {
            receiverWs.send(JSON.stringify({ type: 'typing', payload: { from: userId, isTyping } }));
          }
          break;
        }

        default:
          ws.send(JSON.stringify({ type: 'error', payload: { code: 1, message: '未知消息类型' } }));
      }
    });

    ws.on('close', () => {
      if (userId) {
        connections.delete(userId);
        broadcastFriendOnlineStatus(userId, false);
      }
    });

    ws.on('error', () => {
      if (userId) {
        connections.delete(userId);
      }
    });
  });

  function broadcastFriendOnlineStatus(userId, online) {
    const friendsResult = friendService.getFriendsList(userId);
    if (friendsResult.code === 0 && friendsResult.data) {
      friendsResult.data.friends.forEach(friend => {
        const friendWs = connections.get(friend.id);
        if (friendWs && friendWs.readyState === 1) {
          friendWs.send(JSON.stringify({ type: 'user.online', payload: { userId, online } }));
        }
      });
    }
  }

  /**
   * Send a friend request notification to a specific user
   */
  function sendFriendRequestNotification(toUserId, request) {
    const ws = connections.get(toUserId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'friend.request', payload: { request } }));
    }
  }

  /**
   * Send a friend accepted notification
   */
  function sendFriendAcceptedNotification(toUserId, friend) {
    const ws = connections.get(toUserId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'friend.accepted', payload: { friend } }));
    }
  }

  return {
    connections,
    sendFriendRequestNotification,
    sendFriendAcceptedNotification,
  };
}

module.exports = createChatHandler;
