import { ApexOptions } from 'apexcharts';
// @mui
import { useTheme } from '@mui/material/styles';
import Card, { CardProps } from '@mui/material/Card';
// utils
import { fNumber, fPercent } from 'src/utils/format-number';
import Header from './header/header';
import Dapps from './dapps/dapps';
import Balances from './balances/balances';
import { Grid } from '@mui/material';
// components

// ----------------------------------------------------------------------

interface Props extends CardProps {
  isConnected: boolean;
  address: string;
  emptyBalance: boolean;
}

export default function Wallet({ isConnected, address, emptyBalance, sx, ...other }: Props) {
  // const onConnect = async (uri) => {
  //   try {
  //     setLoading(true);
  //     const { version } = parseUri(uri);
  //     console.log(version);

  //     // Route the provided URI to the v1 SignClient if URI version indicates it, else use v2.
  //     if (version === 1) {
  //       createLegacySignClient({ uri });
  //     } else {
  //       await signClient.pair({ uri });
  //     }
  //   } catch (err) {
  //     alert(err);
  //   } finally {
  //     // setUri('');
  //     setLoading(false);
  //   }
  // };

  return (
    <Grid xs={12}>
      {/* <Header isConnected={isConnected} balance={} />

      <Dapps onConnect={onConnect} /> */}

      <Balances />
    </Grid>
  );
}
