import { useState } from 'react';

// @mui
import { Stack, Dialog, Button, TextField, Typography, Box } from '@mui/material';
import Link from 'next/link';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: any;
  onSubmit: any;
};

export default function ConnectDapp({ open, onClose, onSubmit }: Props) {
  const { t } = useLocales();
  const [uri, setUri] = useState('');

  const handleUri = (event: any) => setUri(event.target.value);

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
        <Typography variant="h6"> {t('home.wallet.dapps.modals.connect.title')} </Typography>

        <Box
          component="img"
          src="/assets/icons/walletConnectIcon.svg"
          sx={{ width: 32, height: 32, cursor: 'pointer', ml: 1 }}
        />
      </Stack>

      <Stack sx={{ p: 2.5 }}>
        <Typography variant="body1">
          {t('home.wallet.dapps.modals.connect.body')}
          {/* <Link href="https://www.google.com">guide</Link> */}
        </Typography>

        <TextField
          value={uri}
          onChange={handleUri}
          placeholder={t('home.wallet.dapps.modals.connect.placeholder') || ''}
          sx={{ mt: 2 }}
        />

        <Button
          variant="contained"
          size="large"
          disabled={uri === ''}
          onClick={handleSubmit}
          sx={{ mt: 2 }}
        >
          {t('common.actions.connect')}
        </Button>
      </Stack>
    </Dialog>
  );
}
