'use client';

import { useEffect, useState, useCallback } from 'react';

// moralis
import { useEvmNativeBalance, useEvmWalletTokenBalances } from '@moralisweb3/next';
// import { EvmChain } from 'moralis/common-evm-utils';

// @mui
import { useTheme } from '@mui/material/styles';
import { CircularProgress, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

// redux
import { useSelector } from 'src/redux/store';

// hooks
import { useSettingsContext } from 'src/components/settings';

// utils

// components
import AnalyticsWidget from '../statistics/analytics-widget';
import Connect from '../onboard/connect';
import Deposit from '../onboard/deposit';
import Header from '../wallet/header/header';
import Dapps from '../wallet/dapps/dapps';
import Balances from '../wallet/balances/balances';
import WalletConnectModalHandler from 'src/components/walletConnect/WalletConnectModalHandler';

import useWalletConnect from 'src/hooks/useWalletConnect';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';
import { useWalletContext } from 'src/contexts/WalletContext';

// ----------------------------------------------------------------------

export default function DashboardView() {
  /** HOOKS */
  const theme = useTheme();
  const settings = useSettingsContext();

  const { connectionStatus: websocketStatus } = useWebsocketContext();

  const { connectionStatus, smartWalletAddress } = useWalletContext();

  /** REDUX */
  const { clients, transactions, batches } = useSelector((state) => state.state);

  /** STATE */
  const [totalTransactions, setTotalTransactions] = useState();
  const [totalBatches, setTotalBatches] = useState();

  const { data: nativeBalance } = useEvmNativeBalance({
    // chain: process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? EvmChain.ETHEREUM : EvmChain.GOERLI,
    address: smartWalletAddress,
  });
  const { data: tokenBalances } = useEvmWalletTokenBalances({
    // chain: process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? EvmChain.ETHEREUM : EvmChain.GOERLI,
    address: smartWalletAddress,
  });
  const { connections, connect, disconnect, isConnecting } = useWalletConnect({
    account: smartWalletAddress,
    chainId: '5',
  });

  const { getState } = useWebsocketContext();

  const getStateCallback = useCallback(() => {
    getState();
  }, []);

  useEffect(() => {
    getStateCallback();
  }, [getStateCallback]);

  useEffect(() => {
    if (transactions) setTotalTransactions(sumValues(transactions));
    if (batches) setTotalBatches(sumValues(batches));
  }, [transactions, batches]);

  /** CONSTANTS */
  const zeroBalance = nativeBalance?.balance.ether == '0' || tokenBalances?.length === 0;

  const sumValues = (obj: object) => {
    if (obj) return Object.values(obj).reduce((a, b) => a + b, 0) || 0;
    else return 0;
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      {/* Welcome */}
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Hey, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics */}
        {websocketStatus === 'Connecting' ||
          (websocketStatus === 'Closing' && <CircularProgress />)}
        {websocketStatus === 'Closed' ||
          (websocketStatus === 'Uninstantiated' && <h1>Unable to connect to API.</h1>)}
        {websocketStatus === 'Open' && (
          <>
            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidget
                title="Connected Clients"
                total={clients?.TOTAL || 100}
                color="info"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidget
                title="Pending Transactions"
                total={transactions?.NEW || 100}
                color="warning"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidget
                title="Total Transactions"
                total={totalTransactions || 100}
                color="error"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidget
                title="Total Batches"
                total={totalBatches || 100}
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
              />
            </Grid>
          </>
        )}

        {/* Onboarding */}
        <Connect />

        {/* Wallet */}
        {connectionStatus === 'connected' && (
          <>
            {zeroBalance && <Deposit />}

            {zeroBalance && (
              <>
                <Grid xs={12}>
                  <Header
                    nativeBalance={parseFloat(nativeBalance?.balance.ether || '0')}
                    tokenBalances={tokenBalances}
                  />

                  <Dapps
                    connections={connections}
                    connect={connect}
                    disconnect={disconnect}
                    isWcConnecting={isConnecting}
                  />

                  {tokenBalances && (
                    <Balances
                      nativeBalance={parseFloat(nativeBalance?.balance.ether || '0')}
                      tokenBalances={tokenBalances}
                    />
                  )}

                  <WalletConnectModalHandler />
                </Grid>
              </>
            )}
          </>
        )}
      </Grid>
    </Container>
  );
}
