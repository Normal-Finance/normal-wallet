import QRCode from 'react-qr-code';

// @mui
import { Stack, Dialog, Typography, Tooltip } from '@mui/material';

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
      <Stack sx={{ p: 2.5, alignItems: 'center' }}>
        <QRCode value={smartWalletAddress} />

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Your Normal Address
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {smartWalletAddress}
          </Typography>

          <Tooltip title="Copy Address">
            <Iconify
              icon="eva:copy-outline"
              onClick={handleCopyAddress}
              sx={{ color: 'text.disabled' }}
            />
          </Tooltip>
        </Stack>
      </Stack>
    </Dialog>
  );
}
