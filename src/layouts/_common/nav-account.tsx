import { useState } from 'react';

import QRCode from 'react-qr-code';

// @mui
import { styled } from '@mui/material/styles';
import { Avatar, Box, Skeleton, Tooltip, Typography } from '@mui/material';
// hooks
import { useWalletContext } from 'src/contexts/WalletContext';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { useSnackbar } from 'src/components/snackbar';
// components
import Receive from 'src/sections/dashboard/wallet/header/modals/Receive';
import Iconify from 'src/components/iconify/iconify';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
}));

// ----------------------------------------------------------------------

export default function NavAccount() {
  const { copy } = useCopyToClipboard();
  const { enqueueSnackbar } = useSnackbar();
  const { walletAddresses, smartWallet } = useWalletContext();
  const { trackEvent } = useAnalyticsContext();

  const [openReceive, setOpenReceive] = useState(false);

  const handleOpenReceive = () => {
    setOpenReceive(true);
  };

  const handleCloseReceive = () => {
    setOpenReceive(false);
  };

  const handleCopyAddress = async () => {
    if (!walletAddresses.smart) enqueueSnackbar('Unable to copy address', { variant: 'error' });
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
    <StyledRoot>
      <Avatar
        variant="rounded"
        onClick={handleOpenReceive}
        sx={{
          width: 64,
          height: 64,
          bgcolor: 'background.neutral',
        }}
      >
        <Box sx={{ width: 64, height: 64 }}>
          {smartWallet ? (
            <QRCode value={walletAddresses.smart} size={60} />
          ) : (
            <QRCode value="empty" style={{ filter: 'blur(8px)' }} size={60} />
          )}
        </Box>
      </Avatar>

      <Box sx={{ ml: 2, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {smartWallet ? (
            'Normal Address'
          ) : (
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} width={100} />
          )}
        </Typography>

        <Tooltip title={walletAddresses.smart}>
          <Typography variant="body1" noWrap sx={{ color: 'text.secondary' }}>
            {smartWallet ? (
              `${walletAddresses.smart.slice(0, 5)}...${walletAddresses.smart.slice(-4)}`
            ) : (
              <Skeleton />
            )}

            {smartWallet && (
              <Iconify
                icon="eva:copy-outline"
                onClick={handleCopyAddress}
                sx={{ ml: 1, color: 'text.disabled' }}
              />
            )}
          </Typography>
        </Tooltip>
      </Box>

      {smartWallet && <Receive open={openReceive} onClose={handleCloseReceive} />}
    </StyledRoot>
  );
}
