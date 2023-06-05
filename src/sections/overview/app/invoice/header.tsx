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
          <Button
            component={RouterLink}
            href="https://www.google.com"
            variant="contained"
            startIcon={<Iconify icon="mingcute:send-fill" />}
          >
            Send
          </Button>

          <Button
            component={RouterLink}
            href="https://www.google.com"
            variant="contained"
            startIcon={<Iconify icon="mingcute:qrcode-2-line" />}
          >
            Receive
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
