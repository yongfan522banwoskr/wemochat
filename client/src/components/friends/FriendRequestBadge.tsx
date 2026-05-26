import { useState } from 'react';
import { Badge, IconButton, Popover, List, ListItem, ListItemAvatar, Avatar, ListItemText, Button, Box, Typography } from '@mui/material';
import { PeopleAlt } from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';

export default function FriendRequestBadge() {
  const { pendingRequests, respondToRequest } = useChat();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton size="small" onClick={e => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={pendingRequests.length} color="error">
          <PeopleAlt />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box className="w-80 p-3">
          <Typography variant="subtitle2" className="mb-2">好友请求</Typography>
          {pendingRequests.length === 0 ? (
            <div className="text-gray-400 text-sm py-4 text-center">暂无好友请求</div>
          ) : (
            <List dense>
              {pendingRequests.map(req => (
                <ListItem key={req.id} secondaryAction={
                  <Box className="flex gap-1">
                    <Button size="small" variant="contained" onClick={() => { respondToRequest(req.id, 'accept'); setAnchorEl(null); }}>
                      接受
                    </Button>
                    <Button size="small" color="error" onClick={() => { respondToRequest(req.id, 'reject'); setAnchorEl(null); }}>
                      拒绝
                    </Button>
                  </Box>
                }>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#6366f1', width: 32, height: 32, fontSize: 14 }}>
                      {req.fromUser?.displayName?.charAt(0)?.toUpperCase() || '?'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={req.fromUser?.displayName || req.fromId}
                    secondary={`@${req.fromId}`}
                    primaryTypographyProps={{ fontSize: 14 }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
