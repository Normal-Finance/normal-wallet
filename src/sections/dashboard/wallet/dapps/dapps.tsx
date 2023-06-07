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
import { useState } from 'react';

// utils
import { createLegacySignClient } from 'src/utils/walletConnect/LegacyWalletConnectUtil';
import { parseUri } from '@walletconnect/utils';
import { signClient } from 'src/utils/walletConnect/WalletConnectUtil';
import ConnectDapp from './modals/ConnectDapp';

// ----------------------------------------------------------------------

type Props = {
  // onConnect: any;
  // connections: any[];
  // onDisconnect: any;
};

export default function Dapps({}: Props) {
  const [loading, setLoading] = useState(false);
  const [openConnect, setOpenConnect] = useState(false);

  const handleOpenConnect = () => {
    setOpenConnect(true);
  };

  const handleCloseConnect = () => {
    setOpenConnect(false);
  };

  const connections: any = [];

  const onConnect = async (uri: string) => {
    try {
      setLoading(true);
      const { version } = parseUri(uri);
      console.log(version);

      // Route the provided URI to the v1 SignClient if URI version indicates it, else use v2.
      if (version === 1) {
        createLegacySignClient({ uri });
      } else {
        await signClient.pair({ uri });
      }
    } catch (err) {
      alert(err);
    } finally {
      // setUri('');
      setLoading(false);
    }
  };

  const onDisconnect = async (uri: string) => {
    try {
      setLoading(true);

      signClient.disconnect({ topic: '' });
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

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
            <ConnectionCard key={connection.id} file={connection} onDelete={onDisconnect} />
          ))}
        </Stack>
      </Scrollbar>

      {/* Modal */}
      <ConnectDapp open={openConnect} onClose={handleCloseConnect} onSubmit={onConnect} />
    </>
  );
}
