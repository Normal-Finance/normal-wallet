import { useState } from 'react';

// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { OwnedToken } from 'alchemy-sdk';
import { CircularProgress } from '@mui/material';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';
import { useLocales } from 'src/locales';
import Receive from './modals/Receive';
import Send from './modals/Send';

// ----------------------------------------------------------------------

type Props = {
  loading: boolean;
  ethereumBalance: number;
  tokenBalances: OwnedToken[];
};

export default function Header({ loading, ethereumBalance, tokenBalances }: Props) {
  const { t } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const { trackEvent } = useAnalyticsContext();

  const canSend = ethereumBalance > 0 || tokenBalances.length > 0;

  const [openSend, setOpenSend] = useState(false);
  const [openReceive, setOpenReceive] = useState(false);

  const handleOpenSend = () => {
    if (canSend) {
      trackEvent(AnalyticsEvents.OPENED_SEND);
      setOpenSend(true);
    } else enqueueSnackbar('Wallet is empty, cannot send funds', { variant: 'error' });
  };

  const handleCloseSend = () => {
    setOpenSend(false);
  };

  const handleOpenReceive = () => {
    trackEvent(AnalyticsEvents.OPENED_RECEIVE);
    setOpenReceive(true);
  };

  const handleCloseReceive = () => {
    setOpenReceive(false);
  };

  return (
    <Box sx={{ mb: { xs: 3, md: 3 } }}>
      <Stack direction="row" alignItems="center">
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            {t('home.wallet.header.title')}
          </Typography>

          <Typography variant="body1" gutterBottom>
            {t('home.wallet.header.subtitle')}
          </Typography>

          {loading && <CircularProgress />}
        </Box>

        <Stack direction="row" alignItems="center" spacing={1}>
          {/* Send */}
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:send-fill" />}
            onClick={handleOpenSend}
          >
            {t('common.words.send')}
          </Button>
          {canSend && (
            <Send
              open={openSend}
              ethereumBalance={ethereumBalance}
              tokenBalances={tokenBalances}
              onClose={handleCloseSend}
            />
          )}

          {/* Receive */}
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:qrcode-2-line" />}
            onClick={handleOpenReceive}
          >
            {t('common.words.receive')}
          </Button>
          <Receive open={openReceive} onClose={handleCloseReceive} />
        </Stack>
      </Stack>
    </Box>
  );
}
