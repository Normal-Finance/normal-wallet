import { useState } from 'react';

import QRCode from 'react-qr-code';

// @mui
import { styled, alpha } from '@mui/material/styles';
import { Avatar, Box, Tooltip, Typography } from '@mui/material';
// hooks
import { useWalletContext } from 'src/contexts/WalletContext';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { useSnackbar } from 'src/components/snackbar';
// components
import Receive from 'src/sections/dashboard/wallet/header/modals/Receive';
import Iconify from 'src/components/iconify/iconify';

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
  const { smartWalletAddress } = useWalletContext();

  const [openReceive, setOpenReceive] = useState(false);

  const handleOpenReceive = () => {
    setOpenReceive(true);
  };

  const handleCloseReceive = () => {
    setOpenReceive(false);
  };

  const handleCopyAddress = async () => {
    const success = await copy(smartWalletAddress);
    if (success) enqueueSnackbar('Address copied', { variant: 'success' });
    else enqueueSnackbar('Error copying address', { variant: 'error' });
  };

  return (
    <StyledRoot>
      {smartWalletAddress && (
        <>
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
              <QRCode value={smartWalletAddress} size={60} />
            </Box>
          </Avatar>

          <Box sx={{ ml: 2, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              Normal Address
            </Typography>

            <Tooltip title={smartWalletAddress}>
              <Typography variant="body1" noWrap sx={{ color: 'text.secondary' }}>
                {smartWalletAddress.slice(0, 5) + '...' + smartWalletAddress.slice(-4)}
                <Iconify
                  icon="eva:copy-outline"
                  onClick={handleCopyAddress}
                  sx={{ ml: 1, color: 'text.disabled' }}
                />
              </Typography>
            </Tooltip>
          </Box>

          <Receive open={openReceive} onClose={handleCloseReceive} />
        </>
      )}
    </StyledRoot>
  );
}
