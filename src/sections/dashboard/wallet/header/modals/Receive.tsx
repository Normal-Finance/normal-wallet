import QRCode from 'react-qr-code';

// @mui
import { Stack, Dialog, Typography, IconButton } from '@mui/material';

// components
import Iconify from 'src/components/iconify';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { useWalletContext } from 'src/contexts/WalletContext';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: any;
};

export default function Receive({ open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { smartWalletAddress } = useWalletContext();
  const { copy } = useCopyToClipboard();

  const handleCopyAddress = async () => {
    const success = await copy(smartWalletAddress);
    if (success) enqueueSnackbar('Address copied', { variant: 'success' });
    else enqueueSnackbar('Error copying address', { variant: 'error' });
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          py: 2,
          pl: 2.5,
          pr: 1,
        }}
      >
        <IconButton onClick={onClose}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </Stack>

      <Stack sx={{ p: 2.5 }}>
        <QRCode value={smartWalletAddress} />

        <Typography variant="body1">Your Normal Address</Typography>

        <Typography variant="body1">
          {smartWalletAddress}{' '}
          <Iconify
            icon="eva:copy-outline"
            onClick={handleCopyAddress}
            sx={{ color: 'text.disabled' }}
          />
        </Typography>
      </Stack>
    </Dialog>
  );
}
