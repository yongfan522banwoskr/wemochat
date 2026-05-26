import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import FriendSearch from '../components/friends/FriendSearch';
import FriendRequestBadge from '../components/friends/FriendRequestBadge';

export default function ChatPage() {
  const navigate = useNavigate();
  const { token, user, loading, logout } = useAuth();
  const { activeConversation } = useChat();

  useEffect(() => {
    if (!loading && !token) {
      navigate('/login');
    }
  }, [loading, token, navigate]);

  if (loading) {
    return (
      <Box className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">加载中...</div>
      </Box>
    );
  }

  if (!token || !user) return null;

  return (
    <Box className="h-screen flex bg-gray-100">
      {/* Left sidebar */}
      <Box className="w-80 flex flex-col border-r border-gray-200 bg-white">
        {/* User header */}
        <Box className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Box>
            <div className="font-semibold text-gray-800">{user.displayName}</div>
            <div className="text-xs text-gray-400">@{user.id}</div>
          </Box>
          <Box className="flex gap-2">
            <FriendRequestBadge />
            <FriendSearch />
            <button onClick={logout} className="text-gray-400 hover:text-red-500 text-sm">
              退出
            </button>
          </Box>
        </Box>

        {/* Chat list */}
        <ChatSidebar />
      </Box>

      {/* Right: Chat window or placeholder */}
      <Box className="flex-1">
        {activeConversation ? (
          <ChatWindow friendId={activeConversation} />
        ) : (
          <Box className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">💬</div>
              <div className="text-lg">选择一个好友开始聊天</div>
              <div className="text-sm mt-2">或搜索ID添加新朋友</div>
            </div>
          </Box>
        )}
      </Box>
    </Box>
  );
}
