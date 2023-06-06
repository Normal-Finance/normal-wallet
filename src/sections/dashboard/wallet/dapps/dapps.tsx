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

// ----------------------------------------------------------------------

type Props = {
  // onConnect: any;
  // connections: any[];
  // onDisconnect: any;
};

export default function Dapps({}: Props) {
  const [loading, setLoading] = useState(false);

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

  return (
    <Card
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      <Scrollbar>
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          sx={{ py: 2 }}
        >
          {/* <IconButton color="primary" onClick={onConnect}>
            <Iconify icon="eva:plus-fill" />
          </IconButton>

          {connections.map((connection: any) => (
            <ConnectionCard
              key={connection.id}
              file={connection}
              onDelete={onDisconnect}
            />
          ))} */}
        </Stack>
      </Scrollbar>
    </Card>
  );
}
