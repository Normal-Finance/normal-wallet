import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Stack, Dialog, Button, TextField, Typography, InputAdornment } from '@mui/material';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: any;
  onSubmit: any;
};

export default function ConnectDapp({ open, onClose, onSubmit }: Props) {
  const [uri, setUri] = useState('');

  const handleUri = (event: any) => {
    setUri(event.target.value);
  };

  const handleSubmit = async () => {
    await onSubmit(uri);
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
      </Stack>

      <Stack sx={{ p: 2.5 }}>
        <Typography variant="body1">
          Do not close this window while connecting. Have a question? Follow this <a>guide</a>.
        </Typography>

        <TextField
          value={uri}
          onChange={handleUri}
          placeholder="QR code or link"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon="eva:cast-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <Button variant="contained" size="large" disabled={uri === ''} onClick={handleSubmit}>
          Connect
        </Button>
      </Stack>
    </Dialog>
  );
}
