import { useState } from 'react';

// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// components
import Iconify from 'src/components/iconify';
import Send from './modals/Send';
import Receive from './modals/Receive';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

type Props = {
  nativeBalance: number;
  tokenBalances: any;
};

export default function Header({ nativeBalance, tokenBalances }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const canSend = nativeBalance > 0 || tokenBalances.length > 0;

  const [openSend, setOpenSend] = useState(false);
  const [openReceive, setOpenReceive] = useState(false);

  const handleOpenSend = () => {
    if (canSend) setOpenSend(true);
    else enqueueSnackbar('Wallet is empty, cannot send funds', { variant: 'error' });
  };

  const handleCloseSend = () => {
    setOpenSend(false);
  };

  const handleOpenReceive = () => {
    setOpenReceive(true);
  };

  const handleCloseReceive = () => {
    setOpenReceive(false);
  };

  return (
    <Box sx={{ mb: { xs: 3, md: 5 } }}>
      <Stack direction="row" alignItems="center">
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Normal Wallet
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={1}>
          {/* Send */}
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:send-fill" />}
            onClick={handleOpenSend}
          >
            Send
          </Button>
          {/* {canSend &&  */}
          <Send
            open={openSend}
            nativeBalance={nativeBalance}
            tokenBalances={tokenBalances}
            onClose={handleCloseSend}
          />
          {/* } */}

          {/* Receive */}
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:qrcode-2-line" />}
            onClick={handleOpenReceive}
          >
            Receive
          </Button>
          <Receive open={openReceive} onClose={handleCloseReceive} />
        </Stack>
      </Stack>
    </Box>
  );
}
