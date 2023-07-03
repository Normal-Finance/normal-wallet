import { useState } from 'react';

// @mui
import { IconButton, Stack, Button, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar/scrollbar';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';
import ConnectionCard from './connection-card';
import ConnectDapp from './modals/ConnectDapp';

// ----------------------------------------------------------------------

type Props = {
  connections: any[];
  connect: any;
  disconnect: any;
  isWcConnecting: boolean;
};

export default function Dapps({ connections, connect, disconnect, isWcConnecting }: Props) {
  const { trackEvent } = useAnalyticsContext();

  const [openConnect, setOpenConnect] = useState(false);

  const handleOpenConnect = () => {
    trackEvent(AnalyticsEvents.OPENED_CONNECT_DAPP);
    setOpenConnect(true);
  };

  const handleOnConnect = (uri: string) => {
    trackEvent(AnalyticsEvents.REQUESTED_CONNECT_DAPP);
    connect({ uri });
  };

  const handleCloseConnect = () => setOpenConnect(false);

  if (isWcConnecting) return <CircularProgress />;

  return (
    <>
      <Scrollbar>
        <Stack direction="row" sx={{ py: 1 }}>
          {/* Button */}
          {connections.length > 0 ? (
            <IconButton
              size="small"
              color="primary"
              onClick={handleOpenConnect}
              sx={{
                width: 48,
                height: 48,
                mt: 2.5,
                mr: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <Iconify icon="mingcute:add-line" />
            </IconButton>
          ) : (
            <Button
              variant="contained"
              size="large"
              color="info"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={handleOpenConnect}
            >
              Connect Dapp
              <Box
                component="img"
                src="/assets/icons/walletConnect.svg"
                sx={{ width: 24, height: 24, cursor: 'pointer', ml: 1 }}
              />
            </Button>
          )}

          {connections.map((connection: any, index: any) => (
            <ConnectionCard key={index} connection={connection} onDisconnect={disconnect} />
          ))}
        </Stack>
      </Scrollbar>

      {/* Modal */}
      <ConnectDapp open={openConnect} onClose={handleCloseConnect} onSubmit={handleOnConnect} />
    </>
  );
}
