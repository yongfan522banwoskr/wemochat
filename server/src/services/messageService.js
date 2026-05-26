function createMessageService(messageStore) {
  return {
    sendMessage(senderId, receiverId, content) {
      if (!content || !content.trim()) {
        return { code: 1, message: '消息不能为空' };
      }
      const msg = messageStore.save(senderId, receiverId, content.trim());
      return { code: 0, data: { message: msg }, message: 'ok' };
    },

    getMessages(userId1, userId2, limit = 50, before = null) {
      const messages = messageStore.getConversation(userId1, userId2, limit, before);
      return { code: 0, data: { messages }, message: 'ok' };
    },

    markAsRead(byUserId, messageIds) {
      messageStore.markRead(byUserId, messageIds);
      return { code: 0, message: 'ok' };
    },

    getUnreadCount(userId, friendId) {
      return messageStore.getUnreadCount(userId, friendId);
    },
  };
}

module.exports = createMessageService;
