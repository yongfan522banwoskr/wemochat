import { Box } from '@mui/material';
import type { Message } from '../../types';

interface Props {
  message: Message;
  isMine: boolean;
}

export default function MessageBubble({ message, isMine }: Props) {
  const time = new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  return (
    <Box className={`flex mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
      <Box className={`max-w-[70%] px-4 py-2 rounded-2xl ${
        isMine
          ? 'bg-indigo-500 text-white rounded-br-md'
          : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
      }`}>
        <div className="text-sm break-words">{message.content}</div>
        <div className={`text-xs mt-1 ${isMine ? 'text-indigo-200' : 'text-gray-400'} text-right`}>
          {time}
          {isMine && (message.read ? ' ✓✓' : ' ✓')}
        </div>
      </Box>
    </Box>
  );
}
