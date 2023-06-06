'use client';

import { useState, useEffect, useCallback } from 'react';

// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

// redux
import { useDispatch, useSelector } from 'src/redux/store';

// moralis
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

// hooks
import { useSettingsContext } from 'src/components/settings';

import { useAddress } from '@thirdweb-dev/react';
import useInitialization from 'src/hooks/walletConnect/useInitialization';
import useWalletConnectEventsManager from 'src/hooks/walletConnect/useWalletConnectEventsManager';

// utils
import { createLegacySignClient } from 'src/utils/walletConnect/LegacyWalletConnectUtil';

// components
import Statistics from '../statistics';
import Wallet from '../wallet';
import Connect from '../onboard/connect';
import Deposit from '../onboard/deposit';
import GetStarted from '../onboard/get-started';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';

// ----------------------------------------------------------------------

export default function DashboardView() {
  /** HOOKS */
  const settings = useSettingsContext();
  const address = useAddress();

  /** STATE */
  const [loading, setLoading] = useState(false);
  const [appState, setAppState] = useState<any>();

  /** CONSTANTS */
  const isConnected = address === '' || address === undefined;

  const { transaction, batch } = useSelector((state) => state.state);

  const { getState } = useWebsocketContext();

  const getStateCallback = useCallback(() => {
    getState();
  }, []);

  useEffect(() => {
    getStateCallback();
  }, [getStateCallback]);

  /** FUNCTIONS */

  // useEffect(() => {
  //   if (isConnected) {
  //     getBalances();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isConnected]);

  // async function getBalances() {
  //   const { balance: nativeBalance } = await Moralis.EvmApi.balance.getNativeBalance({
  //     chain: EvmChain.ETHEREUM,
  //     address,
  //   });

  //   const walletTokenBalances = await Moralis.EvmApi.token.getWalletTokenBalances({
  //     address,
  //     chain: EvmChain.ETHEREUM,
  //   });
  // }

  /** WALLET_CONNECT */
  // const initialized = useInitialization();
  // useWalletConnectEventsManager(initialized);
  // createLegacySignClient();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        {appState && <Statistics appState={appState} loading={loading} />}

        {!isConnected && <Connect />}
        {isConnected && (
          <>
            {/* {emptyBalance && <Deposit address={address} />}

            {!emptyBalance && <GetStarted />} */}
          </>
        )}

        {/* <Wallet isConnected={true} address='' emptyBalance={false} /> */}
      </Grid>
    </Container>
  );
}
