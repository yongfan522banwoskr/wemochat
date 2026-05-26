import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Avatar, Badge } from '@mui/material';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import type { Message } from '../../types';

interface Props {
  friendId: string;
}

export default function ChatWindow({ friendId }: Props) {
  const { user } = useAuth();
  const { messages, loadMessages, conversations } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [friend, setFriend] = useState<{ displayName: string; online: boolean } | null>(null);

  useEffect(() => {
    loadMessages(friendId);
    const conv = conversations.find(c => c.friendId === friendId);
    if (conv) {
      setFriend({ displayName: conv.friendName, online: conv.isOnline });
    }
  }, [friendId, conversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[friendId]?.length]);

  const msgs: Message[] = messages[friendId] || [];

  return (
    <Box className="h-full flex flex-col">
      {/* Header */}
      <Box className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
        <Badge color="success" variant="dot" invisible={!friend?.online}>
          <Avatar sx={{ bgcolor: '#6366f1' }}>{friend?.displayName?.charAt(0)?.toUpperCase() || '?'}</Avatar>
        </Badge>
        <Box>
          <Typography variant="subtitle1" className="font-semibold">{friend?.displayName || friendId}</Typography>
          <Typography variant="caption" className="text-gray-400">
            {friend?.online ? '在线' : '离线'}
          </Typography>
        </Box>
      </Box>

      {/* Messages */}
      <Box className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {msgs.length === 0 && (
          <Box className="text-center text-gray-400 mt-20">
            <div className="text-4xl mb-2">👋</div>
            <div>发送第一条消息开始聊天</div>
          </Box>
        )}
        {msgs.map(msg => (
          <MessageBubble key={msg.id} message={msg} isMine={msg.senderId === user?.id} />
        ))}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <MessageInput friendId={friendId} />
    </Box>
  );
}
