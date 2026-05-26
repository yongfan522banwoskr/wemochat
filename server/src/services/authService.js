const { generateMnemonicWords, validateMnemonicWords } = require('../utils/mnemonic');
const { hashMnemonic } = require('../utils/hash');

function createAuthService(userStore, sessionStore) {
  const ID_REGEX = /^[a-zA-Z0-9]{3,20}$/;

  return {
    register(id) {
      if (!id || !ID_REGEX.test(id)) {
        return { code: 2, message: 'ID格式不合法 (3-20位字母或数字)' };
      }
      if (userStore.exists(id)) {
        return { code: 1, message: 'ID已被占用' };
      }
      const words = generateMnemonicWords(3);
      const mnemonicHash = hashMnemonic(words);
      const user = {
        id,
        mnemonicHash,
        displayName: id,
        createdAt: new Date().toISOString(),
        online: false,
      };
      userStore.create(user);
      return { code: 0, data: { id, mnemonicWords: words }, message: 'ok' };
    },

    login(id, mnemonicWords) {
      if (!validateMnemonicWords(mnemonicWords)) {
        return { code: 1, message: 'ID或助记词错误' };
      }
      const user = userStore.findById(id);
      if (!user) {
        return { code: 1, message: 'ID或助记词错误' };
      }
      const inputHash = hashMnemonic(mnemonicWords);
      if (inputHash !== user.mnemonicHash) {
        return { code: 1, message: 'ID或助记词错误' };
      }
      userStore.updateOnline(id, true);
      const token = sessionStore.create(id);
      return {
        code: 0,
        data: {
          token,
          user: { id: user.id, displayName: user.displayName, online: true },
        },
        message: 'ok',
      };
    },

    logout(token) {
      const userId = sessionStore.validate(token);
      if (userId) {
        userStore.updateOnline(userId, false);
        sessionStore.remove(token);
      }
      return { code: 0, message: 'ok' };
    },

    getMe(token) {
      const userId = sessionStore.validate(token);
      if (!userId) {
        return { code: 1, message: '未登录' };
      }
      const user = userStore.findById(userId);
      if (!user) {
        return { code: 1, message: '用户不存在' };
      }
      return {
        code: 0,
        data: { user: { id: user.id, displayName: user.displayName, online: user.online } },
        message: 'ok',
      };
    },
  };
}

module.exports = createAuthService;
