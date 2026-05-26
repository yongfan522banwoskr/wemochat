function createUserService(userStore) {
  return {
    search(query) {
      if (!query || query.length < 1) {
        return { code: 1, message: '请输入搜索关键词' };
      }
      const users = userStore.search(query);
      return { code: 0, data: { users }, message: 'ok' };
    },

    getById(id) {
      const user = userStore.findById(id);
      if (!user) {
        return { code: 1, message: '用户不存在' };
      }
      return { code: 0, data: { user: { id: user.id, displayName: user.displayName, online: user.online } }, message: 'ok' };
    },
  };
}

module.exports = createUserService;
