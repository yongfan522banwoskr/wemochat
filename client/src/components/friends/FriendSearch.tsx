import { useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, TextField, List, ListItemButton, ListItemAvatar, Avatar, ListItemText, Button, Alert } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';
import type { User } from '../../types';

export default function FriendSearch() {
  const { searchUsers, addFriend } = useChat();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const users = await searchUsers(query.trim().toLowerCase());
    setResults(users);
    setSearching(false);
  };

  const handleAdd = async (userId: string) => {
    const msg = await addFriend(userId);
    setMessage(msg);
  };

  return (
    <>
      <Button size="small" variant="outlined" startIcon={<PersonAdd />} onClick={() => setOpen(true)}>
        添加好友
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加好友</DialogTitle>
        <DialogContent>
          {message && <Alert severity="info" className="mb-3">{message}</Alert>}

          <Box className="flex gap-2 mb-4">
            <TextField
              fullWidth size="small" label="搜索用户ID" value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="contained" onClick={handleSearch} disabled={searching}>
              {searching ? '...' : '搜索'}
            </Button>
          </Box>

          {results.length === 0 && query && !searching && (
            <div className="text-center text-gray-400 py-4">未找到用户</div>
          )}

          <List>
            {results.map(u => (
              <ListItemButton key={u.id}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#6366f1' }}>{u.displayName.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={u.displayName} secondary={`@${u.id}`} />
                <Button size="small" variant="outlined" onClick={() => handleAdd(u.id)}>
                  添加
                </Button>
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}
