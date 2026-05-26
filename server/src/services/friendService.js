function createFriendService(friendStore, userStore) {
  return {
    sendRequest(fromId, toId) {
      if (fromId === toId) {
        return { code: 1, message: '不能添加自己为好友' };
      }
      if (!userStore.exists(toId)) {
        return { code: 1, message: '用户不存在' };
      }
      if (friendStore.areFriends(fromId, toId)) {
        return { code: 1, message: '已经是好友' };
      }
      if (friendStore.hasPendingRequest(fromId, toId)) {
        return { code: 2, message: '已有待处理的好友请求' };
      }
      // Check if the other user already sent a request to us
      if (friendStore.hasPendingRequest(toId, fromId)) {
        return { code: 2, message: '对方已向你发送好友请求，请前往处理' };
      }
      const request = friendStore.createRequest(fromId, toId);
      const fromUser = userStore.findById(fromId);
      return {
        code: 0,
        data: {
          requestId: request.id,
          request: {
            ...request,
            fromUser: fromUser ? { id: fromUser.id, displayName: fromUser.displayName } : null,
          },
        },
        message: '好友请求已发送',
      };
    },

    respondToRequest(userId, requestId, action) {
      const request = friendStore.getRequest(requestId);
      if (!request) {
        return { code: 1, message: '请求不存在' };
      }
      if (request.toId !== userId) {
        return { code: 1, message: '无权处理此请求' };
      }
      if (request.status !== 'pending') {
        return { code: 1, message: '请求已处理' };
      }
      if (action === 'accept') {
        const result = friendStore.acceptRequest(requestId);
        if (!result) return { code: 1, message: '处理失败' };
        return {
          code: 0,
          data: { friendship: result.friendship, request: result.request },
          message: '已添加好友',
        };
      } else if (action === 'reject') {
        friendStore.rejectRequest(requestId);
        return { code: 0, message: '已拒绝' };
      }
      return { code: 1, message: '无效操作' };
    },

    getFriendsList(userId) {
      const friendIds = friendStore.getFriendsList(userId);
      const friends = friendIds.map(id => {
        const u = userStore.findById(id);
        return u ? { id: u.id, displayName: u.displayName, online: u.online } : { id, displayName: id, online: false };
      });
      return { code: 0, data: { friends }, message: 'ok' };
    },

    getPendingRequests(userId) {
      const requests = friendStore.getPendingRequests(userId);
      const enriched = requests.map(r => {
        const fromUser = userStore.findById(r.fromId);
        return {
          ...r,
          fromUser: fromUser ? { id: fromUser.id, displayName: fromUser.displayName } : null,
        };
      });
      return { code: 0, data: { requests: enriched }, message: 'ok' };
    },
  };
}

module.exports = createFriendService;
