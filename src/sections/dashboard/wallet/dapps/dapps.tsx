import { useState } from 'react';

// @mui
import { Divider, IconButton, Stack, Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

// components
import Iconify from 'src/components/iconify';
import ConnectionCard from './connection-card';
import Scrollbar from 'src/components/scrollbar/scrollbar';
import ConnectDapp from './modals/ConnectDapp';

// ----------------------------------------------------------------------

type Props = {
  connections: any[];
  connect: any;
  disconnect: any;
  isWcConnecting: boolean;
};

export default function Dapps({ connections, connect, disconnect, isWcConnecting }: Props) {
  const [openConnect, setOpenConnect] = useState(false);

  const handleOpenConnect = () => setOpenConnect(true);

  const handleCloseConnect = () => setOpenConnect(false);

  if (isWcConnecting) return <CircularProgress />;

  return (
    <>
      <Scrollbar>
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          sx={{ py: 2 }}
        >
          {/* Button */}
          {connections.length > 0 ? (
            <IconButton color="info" aria-label="add new dapp" onClick={handleOpenConnect}>
              <Iconify icon="eva:plus-fill" />
            </IconButton>
          ) : (
            <Button
              variant="contained"
              size="large"
              color="info"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={handleOpenConnect}
            >
              Connect Dapps
            </Button>
          )}

          {connections.map((connection: any, index: any) => (
            <ConnectionCard key={index} connection={connection} onDisconnect={disconnect} />
          ))}
        </Stack>
      </Scrollbar>

      {/* Modal */}
      <ConnectDapp open={openConnect} onClose={handleCloseConnect} onSubmit={connect} />
    </>
  );
}
