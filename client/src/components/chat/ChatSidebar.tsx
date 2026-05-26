import { Box, List, ListItemButton, ListItemText, ListItemAvatar, Avatar, Badge } from '@mui/material';
import { useChat } from '../../context/ChatContext';

export default function ChatSidebar() {
  const { conversations, activeConversation, setActiveConversation } = useChat();

  const sorted = [...conversations].sort((a, b) => {
    if (!a.lastMessageTime) return 1;
    if (!b.lastMessageTime) return -1;
    return b.lastMessageTime.localeCompare(a.lastMessageTime);
  });

  return (
    <Box className="flex-1 overflow-y-auto">
      {sorted.length === 0 ? (
        <Box className="p-6 text-center text-gray-400 text-sm">
          暂无好友聊天<br />搜索ID添加第一个好友吧
        </Box>
      ) : (
        <List disablePadding>
          {sorted.map(conv => (
            <ListItemButton
              key={conv.friendId}
              selected={activeConversation === conv.friendId}
              onClick={() => setActiveConversation(conv.friendId)}
              className="border-b border-gray-50"
            >
              <ListItemAvatar>
                <Badge color="success" variant="dot" invisible={!conv.isOnline}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                  <Avatar sx={{ bgcolor: stringToColor(conv.friendId) }}>
                    {conv.friendName.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={conv.friendName}
                secondary={conv.lastMessage || '开始聊天吧~'}
                primaryTypographyProps={{ fontSize: 14, fontWeight: activeConversation === conv.friendId ? 600 : 400 }}
                secondaryTypographyProps={{ fontSize: 12, noWrap: true }}
              />
              {conv.unreadCount > 0 && (
                <Box className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                </Box>
              )}
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];
  return colors[Math.abs(hash) % colors.length];
}
