'use client';

import { useState } from 'react';

// moralis
import { useEvmNativeBalance, useEvmWalletTokenBalances } from '@moralisweb3/next';

// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

// redux
import { useSelector } from 'src/redux/store';

// hooks
import { useSettingsContext } from 'src/components/settings';

import { useAddress } from '@thirdweb-dev/react';

// utils

// components
import Connect from '../onboard/connect';
import Deposit from '../onboard/deposit';
import Header from '../wallet/header/header';
import Dapps from '../wallet/dapps/dapps';
import Balances from '../wallet/balances/balances';
import SummaryWidget from '../statistics/summary-widget';
import RealtimeWidgets from '../statistics/realtime-widgets';
import Modal from 'src/components/walletConnect/Modal';

import useWalletConnect from 'src/hooks/useWalletConnect';
import { useLocalStorage } from 'src/hooks/use-local-storage';

// ----------------------------------------------------------------------

export default function DashboardView() {
  /** HOOKS */
  const theme = useTheme();
  const settings = useSettingsContext();
  const address = useAddress();

  const { data: nativeBalance } = useEvmNativeBalance({ address: address || '' });
  const { data: tokenBalances } = useEvmWalletTokenBalances({ address: address || '' });

  /** STATE */
  const [loading, setLoading] = useState(false);

  /** CONSTANTS */
  const disconnected = address == '';
  const zeroBalance = nativeBalance?.balance.ether == '0' || tokenBalances?.length === 0;

  const { connections, transactions, batches } = useSelector((state) => state.state);

  // const { getState } = useWebsocketContext();

  // const getStateCallback = useCallback(() => {
  //   getState();
  // }, []);

  // useEffect(() => {
  //   getStateCallback();
  // }, [getStateCallback]);

  const sumValues = (obj: object) => {
    if (obj) return Object.values(obj).reduce((a, b) => a + b, 0) || 0;
    else return 0;
  };

  const totalTransactions = sumValues(transactions);
  const totalBatches = sumValues(batches);

  const [allRequests, setRequests] = useState<any>([]);
  const {
    connections: _connections,
    connect,
    disconnect,
    isConnecting,
    requests: wcRequests,
    resolveMany: wcResolveMany,
  } = useWalletConnect({
    account: '0x7D504D497b0ca5386F640aDeA2bb86441462d109',
    chainId: '5',
    useStorage: useLocalStorage,
    setRequests: setRequests,
  });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Hey, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <SummaryWidget
            title="Total Transactions"
            percent={0}
            total={totalTransactions}
            chart={{
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <SummaryWidget
            title="Total Batches"
            percent={0}
            total={totalBatches}
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
            total={totalTransactions * 2.5}
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
                  percent: connections?.TOTAL || 0,
                  total: connections?.TOTAL || 0,
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

        {disconnected && <Connect />}
        {!disconnected && (
          <>
            {/* {zeroBalance && ( */}
            <Deposit
              nativeBalance={parseFloat(nativeBalance?.balance.ether || '0')}
              tokenBalances={tokenBalances}
            />
            {/* )} */}
            {zeroBalance && (
              <>
                <Grid xs={12}>
                  <Header
                    address={address || ''}
                    nativeBalance={nativeBalance?.balance.ether || '0'}
                    tokenBalances={tokenBalances}
                    connected={!disconnected}
                  />

                  <Dapps
                    connections={_connections}
                    connect={connect}
                    disconnect={disconnect}
                    isWcConnecting={isConnecting}
                  />
                  <Modal />
                  {/* onConnect={onConnect} connections={[]} onDisconnect={} */}

                  {tokenBalances && (
                    <Balances
                      nativeBalance={nativeBalance?.balance.ether || '0'}
                      tokenBalances={tokenBalances}
                      connected={!disconnected}
                    />
                  )}
                </Grid>
              </>
            )}
          </>
        )}
      </Grid>
    </Container>
  );
}
