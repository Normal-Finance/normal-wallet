import { useState } from 'react';

// @mui
import { Stack, Dialog, Button, TextField, Typography, Box } from '@mui/material';
import Link from 'next/link';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: any;
  onSubmit: any;
};

export default function ConnectDapp({ open, onClose, onSubmit }: Props) {
  const [uri, setUri] = useState('');

  const handleUri = (event: any) => setUri(event.target.value);

  const handleSubmit = async () => {
    await onSubmit({ uri: uri });
    setUri('');
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pt: 2.5, px: 2.5 }}
      >
        <Typography variant="h6"> Connect with WalletConnect </Typography>

        <Box
          component="img"
          src="/assets/icons/walletConnectIcon.svg"
          sx={{ width: 32, height: 32, cursor: 'pointer', ml: 1 }}
        />
      </Stack>

      <Stack sx={{ p: 2.5 }}>
        <Typography variant="body1">
          Do not close this window while connecting. Have a question? Follow this{' '}
          <Link href={'https://www.google.com'}>guide</Link>.
        </Typography>

        <TextField value={uri} onChange={handleUri} placeholder="Paste link here" sx={{ mt: 2 }} />

        <Button
          variant="contained"
          size="large"
          disabled={uri === ''}
          onClick={handleSubmit}
          sx={{ mt: 2 }}
        >
          Connect
        </Button>
      </Stack>
    </Dialog>
  );
}
