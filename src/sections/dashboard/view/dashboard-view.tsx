'use client';

import { useEffect, useState } from 'react';

// moralis
import { useEvmNativeBalance, useEvmWalletTokenBalances } from '@moralisweb3/next';

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
import Connect from '../onboard/connect';
import Deposit from '../onboard/deposit';
import Header from '../wallet/header/header';
import Dapps from '../wallet/dapps/dapps';
import Balances from '../wallet/balances/balances';
import SummaryWidget from '../statistics/summary-widget';
import RealtimeWidgets from '../statistics/realtime-widgets';
import WalletConnectModalHandler from 'src/components/walletConnect/WalletConnectModalHandler';

import useWalletConnect from 'src/hooks/useWalletConnect';
import { useLocalStorage } from 'src/hooks/use-local-storage';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';
import { ReadyState } from 'react-use-websocket';
import { useWalletContext } from 'src/contexts/WalletContext';

// ----------------------------------------------------------------------

export default function DashboardView() {
  /** HOOKS */
  const theme = useTheme();
  const settings = useSettingsContext();

  const { connectionStatus: websocketStatus } = useWebsocketContext();

  const { personalWallet, smartWallet, smartWalletAddress } = useWalletContext();

  /** REDUX */
  const { clients, transactions, batches } = useSelector((state) => state.state);

  /** STATE */
  const [totalTransactions, setTotalTransactions] = useState();
  const [totalBatches, setTotalBatches] = useState();

  const { data: nativeBalance } = useEvmNativeBalance({ address: smartWalletAddress });
  const { data: tokenBalances } = useEvmWalletTokenBalances({ address: smartWalletAddress });
  const { connections, connect, disconnect, isConnecting } = useWalletConnect({
    account: smartWalletAddress,
    chainId: '5',
    useStorage: useLocalStorage,
  });

  // const { getState } = useWebsocketContext();

  // const getStateCallback = useCallback(() => {
  //   getState();
  // }, []);

  // useEffect(() => {
  //   getStateCallback();
  // }, [getStateCallback]);

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
        {websocketStatus === ReadyState.CONNECTING ||
          (websocketStatus === ReadyState.CLOSING && <CircularProgress />)}
        {websocketStatus === ReadyState.CLOSED ||
          (websocketStatus === ReadyState.UNINSTANTIATED && <h1>Unable to connect to API.</h1>)}
        {websocketStatus === ReadyState.OPEN && (
          <>
            <Grid xs={12} md={4}>
              <SummaryWidget
                title="Total Transactions"
                percent={0}
                total={totalTransactions || 0}
                chart={{
                  series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
                }}
              />
            </Grid>

            <Grid xs={12} md={4}>
              <SummaryWidget
                title="Total Batches"
                percent={0}
                total={totalBatches || 0}
                chart={{
                  colors: [theme.palette.info.light, theme.palette.info.main],
                  series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
                }}
              />
            </Grid>

            <Grid xs={12} md={4}>
              <SummaryWidget
                title="Total Savings"
                percent={-0.1}
                total={totalTransactions || 0 * 2.5}
                chart={{
                  colors: [theme.palette.warning.light, theme.palette.warning.main],
                  series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
                }}
              />
            </Grid>

            <Grid xs={12}>
              <RealtimeWidgets
                chart={{
                  series: [
                    {
                      label: 'Clients',
                      percent: clients?.TOTAL || 0,
                      total: clients?.TOTAL || 0,
                    },
                    {
                      label: 'New transactions',
                      percent: transactions?.NEW || 0,
                      total: transactions?.NEW || 0,
                    },
                    {
                      label: 'Pending transactions',
                      percent: transactions?.PENDING || 0,
                      total: transactions?.PENDING || 0,
                    },
                  ],
                }}
              />
            </Grid>
          </>
        )}

        {/* Onboarding */}
        <Connect />

        {/* Wallet */}
        {personalWallet && smartWallet && (
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
