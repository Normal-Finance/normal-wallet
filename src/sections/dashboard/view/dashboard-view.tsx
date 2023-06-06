'use client';

import { useState, useEffect, useCallback } from 'react';

// moralis
import { useEvmNativeBalance, useEvmWalletTokenBalances } from '@moralisweb3/next';

// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

// redux
import { useDispatch, useSelector } from 'src/redux/store';

// hooks
import { useSettingsContext } from 'src/components/settings';

import { useAddress } from '@thirdweb-dev/react';
import useInitialization from 'src/hooks/walletConnect/useInitialization';
import useWalletConnectEventsManager from 'src/hooks/walletConnect/useWalletConnectEventsManager';

// utils
import { createLegacySignClient } from 'src/utils/walletConnect/LegacyWalletConnectUtil';

// components
import Connect from '../onboard/connect';
import Deposit from '../onboard/deposit';
import GetStarted from '../onboard/get-started';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';
import Header from '../wallet/header/header';
import Dapps from '../wallet/dapps/dapps';
import Balances from '../wallet/balances/balances';
import SummaryWidget from '../statistics/summary-widget';
import RealtimeWidgets from '../statistics/realtime-widgets';

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
  const connected = address === '' || address === undefined;

  const { connections, transactions, batches } = useSelector((state) => state.state);

  const { getState } = useWebsocketContext();

  const getStateCallback = useCallback(() => {
    getState();
  }, []);

  useEffect(() => {
    getStateCallback();
  }, [getStateCallback]);

  const sumValues = (obj: object) => {
    if (obj) return Object.values(obj).reduce((a, b) => a + b, 0) || 0;
    else return 0;
  };

  const totalTransactions = sumValues(transactions);
  const totalBatches = sumValues(batches);

  /** FUNCTIONS */

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

        {/* {!connected && <Connect />}
        {connected && (
          <>
            {emptyBalance && <Deposit address={address} />}

            {!emptyBalance && <GetStarted />}
          </>
        )} */}

        {/* {address && <Wallet address={address || ''} emptyBalance={false} connected={connected} />} */}
        {address && (
          <Grid xs={12}>
            <Header
              address={address || ''}
              nativeBalance={nativeBalance?.balance.ether || '0'}
              tokenBalances={tokenBalances}
              connected={connected}
            />

            <Dapps />
            {/* onConnect={onConnect} connections={[]} onDisconnect={} */}

            {tokenBalances && (
              <Balances
                nativeBalance={nativeBalance?.balance.ether || '0'}
                tokenBalances={tokenBalances}
                connected={connected}
              />
            )}
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
