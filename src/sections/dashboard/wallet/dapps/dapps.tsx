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
import { Card, Divider, IconButton } from '@mui/material';
import ConnectionCard from './connection-card';
import Scrollbar from 'src/components/scrollbar/scrollbar';
import { useCallback, useState } from 'react';

// utils
import { createLegacySignClient } from 'src/utils/walletConnect/LegacyWalletConnectUtil';
import { parseUri } from '@walletconnect/utils';
import { signClient } from 'src/utils/walletConnect/WalletConnectUtil';
import ConnectDapp from './modals/ConnectDapp';

// ----------------------------------------------------------------------

type Props = {
  connections: any[];
  connect: any;
  disconnect: any;
  isWcConnecting: boolean;
};

export default function Dapps({ connections, connect, disconnect, isWcConnecting }: Props) {
  const [loading, setLoading] = useState(false);
  const [openConnect, setOpenConnect] = useState(false);

  const handleOpenConnect = () => {
    setOpenConnect(true);
  };

  const handleCloseConnect = () => {
    setOpenConnect(false);
  };

  const isLegacyWC = ({ bridge }: any) => /https:\/\/bridge.walletconnect.org/g.test(bridge);

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

          {connections.map((connection: any) => (
            <ConnectionCard key={connection.id} file={connection} onDelete={disconnect} />
          ))}
        </Stack>
      </Scrollbar>

      {/* Modal */}
      <ConnectDapp open={openConnect} onClose={handleCloseConnect} onSubmit={connect} />
    </>
  );
}
