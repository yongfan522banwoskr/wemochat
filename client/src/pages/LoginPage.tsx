import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [id, setId] = useState('');
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [word3, setWord3] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!id.trim() || !word1.trim() || !word2.trim() || !word3.trim()) {
      setError('请填写完整的ID和3个助记词');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(id.trim().toLowerCase(), [word1.trim().toLowerCase(), word2.trim().toLowerCase(), word3.trim().toLowerCase()]);
    setLoading(false);
    if (result.code === 0) {
      navigate('/chat');
    } else {
      setError(result.message);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <Paper elevation={6} className="w-full max-w-md p-8 rounded-2xl">
        <Typography variant="h4" className="text-center font-bold text-indigo-600 mb-2">
          💬 Wemochat
        </Typography>
        <Typography variant="body2" className="text-center text-gray-500 mb-6">
          使用ID和助记词登录
        </Typography>

        {error && <Alert severity="error" className="mb-4">{error}</Alert>}

        <TextField
          fullWidth label="用户ID" value={id}
          onChange={e => setId(e.target.value)}
          placeholder="输入你的ID"
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          sx={{ mb: 2 }}
        />

        <Box className="flex gap-2 mb-4">
          <TextField label="助记词 1" value={word1} onChange={e => setWord1(e.target.value)} size="small" className="flex-1" />
          <TextField label="助记词 2" value={word2} onChange={e => setWord2(e.target.value)} size="small" className="flex-1" />
          <TextField label="助记词 3" value={word3} onChange={e => setWord3(e.target.value)} size="small" className="flex-1" />
        </Box>

        <Button variant="contained" fullWidth size="large" onClick={handleLogin} disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 py-3">
          {loading ? '登录中...' : '登 录'}
        </Button>

        <Box className="text-center mt-4">
          <Link to="/register" className="text-indigo-600 hover:text-indigo-800 text-sm">
            还没有账号？立即注册 →
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}
