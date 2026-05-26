import { Box, TextField } from '@mui/material';

interface Props {
  words: string[];
  onChange: (words: string[]) => void;
  disabled?: boolean;
}

export default function MnemonicInput({ words, onChange, disabled }: Props) {
  return (
    <Box className="flex gap-2">
      {[0, 1, 2].map(i => (
        <TextField
          key={i}
          label={`助记词 ${i + 1}`}
          value={words[i] || ''}
          onChange={e => {
            const newWords = [...words];
            newWords[i] = e.target.value;
            onChange(newWords);
          }}
          disabled={disabled}
          size="small"
          className="flex-1"
        />
      ))}
    </Box>
  );
}
