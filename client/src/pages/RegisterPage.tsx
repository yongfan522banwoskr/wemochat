import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Paper, Chip } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [id, setId] = useState('');
  const [mnemonic, setMnemonic] = useState<string[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!id.trim()) {
      setError('请输入一个ID');
      return;
    }
    if (!/^[a-zA-Z0-9]{3,20}$/.test(id.trim())) {
      setError('ID需要3-20位字母或数字');
      return;
    }
    setLoading(true);
    setError('');
    const result = await register(id.trim().toLowerCase());
    setLoading(false);
    if (result.code === 0 && result.mnemonicWords) {
      setMnemonic(result.mnemonicWords);
    } else {
      setError(result.message);
    }
  };

  const copyMnemonic = () => {
    if (mnemonic) navigator.clipboard.writeText(mnemonic.join(' '));
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 p-4">
      <Paper elevation={6} className="w-full max-w-md p-8 rounded-2xl">
        <Typography variant="h4" className="text-center font-bold text-emerald-600 mb-2">
          🔑 创建账号
        </Typography>
        <Typography variant="body2" className="text-center text-gray-500 mb-6">
          选择一个ID，系统会为你生成3个助记词
        </Typography>

        {error && <Alert severity="error" className="mb-4">{error}</Alert>}

        {!mnemonic ? (
          <>
            <TextField
              fullWidth label="输入想要的ID (3-20位字母或数字)" value={id}
              onChange={e => setId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              sx={{ mb: 3 }}
            />
            <Button variant="contained" fullWidth size="large" onClick={handleGenerate} disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 py-3">
              {loading ? '生成中...' : '生 成'}
            </Button>
          </>
        ) : (
          <>
            <Alert severity="warning" className="mb-4">
              ⚠️ 请务必保存你的助记词，丢失后将无法恢复账号！
            </Alert>

            <Box className="flex justify-center gap-2 mb-4">
              {mnemonic.map((word, i) => (
                <Chip key={i} label={word} color="primary" variant="outlined"
                  className="text-lg px-4 py-2 font-mono" />
              ))}
            </Box>

            <Button variant="outlined" fullWidth onClick={copyMnemonic} className="mb-4">
              复制助记词
            </Button>

            <Box className="flex items-center gap-2 mb-4">
              <input type="checkbox" checked={saved} onChange={e => setSaved(e.target.checked)} id="saved" />
              <label htmlFor="saved" className="text-sm text-gray-600 cursor-pointer">
                我已安全保存助记词，了解丢失后无法恢复
              </label>
            </Box>

            <Button variant="contained" fullWidth size="large" onClick={goToLogin} disabled={!saved}
              className="bg-emerald-600 hover:bg-emerald-700 py-3">
              确认并前往登录
            </Button>
          </>
        )}

        <Box className="text-center mt-4">
          <Link to="/login" className="text-emerald-600 hover:text-emerald-800 text-sm">
            已有账号？去登录 →
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}
