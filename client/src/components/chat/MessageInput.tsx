import { useState, useRef } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';

interface Props {
  friendId: string;
}

export default function MessageInput({ friendId }: Props) {
  const { sendMessage } = useChat();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(friendId, text);
    setText('');
    inputRef.current?.focus();
  };

  return (
    <Box className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
      <TextField
        fullWidth
        size="small"
        placeholder="输入消息..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        inputRef={inputRef}
        variant="outlined"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
      />
      <IconButton onClick={handleSend} disabled={!text.trim()} className="bg-indigo-500 hover:bg-indigo-600 text-white">
        <Send />
      </IconButton>
    </Box>
  );
}
