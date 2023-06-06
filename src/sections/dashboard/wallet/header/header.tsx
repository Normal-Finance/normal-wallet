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
import { RouterLink } from 'src/routes/components';
import Receive from './modals/Receive';

// ----------------------------------------------------------------------

// type Props = {
//   icon: string;
//   title: string;
//   total: number;
//   percent: number;
//   price: number;
//   color?: string;
// };

export default function Header() {
  const balance = 123.45;

  const [openSend, setOpenSend] = useState(false);
  const [openReceive, setOpenReceive] = useState(false);

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
            {balance}
          </Typography>
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          {/* Send */}
          <Button
            // component={RouterLink}
            variant="contained"
            startIcon={<Iconify icon="mingcute:send-fill" />}
            onClick={handleOpenSend}
          >
            Send
          </Button>
          <Send open={openSend} balances={balances} onClose={handleCloseSend} />

          {/* Receive */}
          <Button
            // component={RouterLink}
            variant="contained"
            startIcon={<Iconify icon="mingcute:qrcode-2-line" />}
            onClick={handleOpenReceive}
          >
            Receive
          </Button>
          <Receive open={openReceive} onClose={handleCloseReceive} address={address} />
        </Box>
      </Stack>
    </Box>
  );
}
