// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
// utils
import { fShortenNumber, fCurrency } from 'src/utils/format-number';
// components
import Iconify from 'src/components/iconify';
import Receive from './modals/Receive';
import { useState } from 'react';
import Send from './modals/Send';

// ----------------------------------------------------------------------

type Props = {
  address: string;
  // totalBalance: number;
  nativeBalance: string;
  tokenBalances: any;
  connected: boolean;
};

export default function Header({ address, nativeBalance, tokenBalances, connected }: Props) {
  const [openSend, setOpenSend] = useState(false);
  const [openReceive, setOpenReceive] = useState(false);

  // const totalBalance =

  const handleOpenSend = () => {
    setOpenSend(true);
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
            Total Balance
          </Typography>

          <Typography variant="body1" gutterBottom>
            Coming soon
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
          <Send
            open={openSend}
            nativeBalance={parseFloat(nativeBalance)}
            tokenBalances={tokenBalances}
            onClose={handleCloseSend}
          />

          {/* Receive */}
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:qrcode-2-line" />}
            onClick={handleOpenReceive}
          >
            Receive
          </Button>
          <Receive open={openReceive} address={address} onClose={handleCloseReceive} />
        </Stack>
      </Stack>
    </Box>
  );
}
