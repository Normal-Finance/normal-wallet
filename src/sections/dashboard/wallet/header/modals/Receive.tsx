import QRCode from 'react-qr-code';

// @mui
import { Stack, Dialog, Typography, Tooltip } from '@mui/material';

// components
import Iconify from 'src/components/iconify';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { useWalletContext } from 'src/contexts/WalletContext';
import { useSnackbar } from 'src/components/snackbar';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: any;
};

export default function Receive({ open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { smartWallet, walletAddresses, smartWalletDisconnectedError } = useWalletContext();
  const { copy } = useCopyToClipboard();
  const { trackEvent } = useAnalyticsContext();

  const handleCopyAddress = async () => {
    if (!smartWallet) smartWalletDisconnectedError();
    else {
      try {
        await copy(walletAddresses.smart);
        enqueueSnackbar('Address copied', { variant: 'success' });
        trackEvent(AnalyticsEvents.COPIED_ADDRESS, { address: walletAddresses.smart });
      } catch (error) {
        enqueueSnackbar('Error copying address', { variant: 'error' });
      }
    }
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Stack sx={{ p: 2.5, alignItems: 'center' }}>
        <QRCode value={walletAddresses.smart} />

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Your Normal Address
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {walletAddresses.smart}
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
