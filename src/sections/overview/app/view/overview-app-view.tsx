'use client';

import { useState, useEffect } from 'react';

// @mui
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAddress } from '@thirdweb-dev/react';

// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// _mock
import { _appFeatured, _appAuthors, _appInstalled, _appRelated, _appInvoices } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
//
import { Typography } from '@mui/material';
import { InvoiceListView } from 'src/sections/overview/app/invoice/view';
import AppWidgetSummary from '../app-widget-summary';
import AppCurrentDownload from '../app-current-download';
import BookingCheckInWidgets from '../booking-check-in-widgets';

import useInitialization from 'src/hooks/walletConnect/useInitialization';
import useWalletConnectEventsManager from 'src/hooks/walletConnect/useWalletConnectEventsManager';
import { createLegacySignClient } from 'src/utils/walletConnect/LegacyWalletConnectUtil';

// ----------------------------------------------------------------------

const socketUrl = 'wss://phus4hn141.execute-api.us-east-2.amazonaws.com/dev';

export default function OverviewAppView() {
  const theme = useTheme();

  const settings = useSettingsContext();

  const [messageHistory, setMessageHistory] = useState([]);
  const [appState, setAppState] = useState({
    connection: {},
    transaction: {},
    batch: {},
    update: {},
  });

  const { sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, readyState, getWebSocket } =
    useWebSocket(socketUrl, {
      onOpen: () => console.log('opened'),
      onClose: () => console.log('closed'),
      onError: (e) => console.error(e),
      shouldReconnect: (closeEvent) => true,
    });

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));

      // parse the message
      const { eventName, data }: any = lastMessage;
      setAppState({ ...appState, [eventName]: data });
    }
  }, [appState, lastMessage, setMessageHistory]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  /** OTHER */
  const address = useAddress();
  const isConnected = address === '' || address === undefined;

  const balance = 0;
  const emptyBalance = balance === 0;

  const { themeStretch } = useSettingsContext();

  // WalletConnect
  // Step 1 - Initialize wallets and wallet connect client
  const initialized = useInitialization();

  // Step 2 - Once initialized, set up wallet connect event manager
  useWalletConnectEventsManager(initialized);

  // Backwards compatibility only - create a legacy v1 SignClient instance.
  createLegacySignClient();

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
          <AppWidgetSummary
            title="Total Transactions"
            percent={2.6}
            total={18765}
            chart={{
              series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total Batches"
            percent={0.2}
            total={4876}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total Savings"
            percent={-0.1}
            total={678}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>

        <Grid xs={12}>
          {/* md={6} lg={4} */}
          <BookingCheckInWidgets
            chart={{
              series: [
                { label: 'Clients', percent: 72, total: 38 },
                { label: 'New transactions', percent: 64, total: 12 },
                { label: 'Pending transactions', percent: 64, total: 4 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12}>
          <InvoiceListView />
        </Grid>
      </Grid>
    </Container>
  );
}
