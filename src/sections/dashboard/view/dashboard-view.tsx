'use client';

import { useEffect, useState, useCallback } from 'react';

// moralis
import { useEvmNativeBalance, useEvmWalletTokenBalances } from '@moralisweb3/next';
// import { EvmChain } from 'moralis/common-evm-utils';

// @mui
import { useTheme } from '@mui/material/styles';
import { Button, CircularProgress, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

// redux
import { useSelector } from 'src/redux/store';

// hooks
import { useSettingsContext } from 'src/components/settings';

// utils

// components
import AnalyticsWidget from '../statistics/analytics-widget';
import GetStarted from '../get-started';
import Header from '../wallet/header/header';
import Dapps from '../wallet/dapps/dapps';
import Balances from '../wallet/balances/balances';
import WalletConnectModalHandler from 'src/components/walletConnect/WalletConnectModalHandler';

import useWalletConnect from 'src/hooks/useWalletConnect';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';
import { useWalletContext } from 'src/contexts/WalletContext';
import Onboarding from '../onboarding';
import FailedPaymentAlert from '../failed-payment-alert';
import { APP_STUFF } from 'src/config-global';

// ----------------------------------------------------------------------

export default function DashboardView() {
  /** HOOKS */
  const theme = useTheme();
  const settings = useSettingsContext();

  const { connectionStatus: websocketStatus, getState, getBillingStatus } = useWebsocketContext();

  const { connectionStatus, smartWalletAddress } = useWalletContext();

  /** REDUX */
  const { clients, transactions, batches, billing } = useSelector((state) => state.state);

  /** STATE */
  const [totalTransactions, setTotalTransactions] = useState();
  const [totalBatches, setTotalBatches] = useState();
  const [smartWalletFunded, setSmartWalletFunded] = useState(false);

  const {
    data: nativeBalance,
    isFetching: loadingNativeBalance,
    error: nativeBalanceError,
  } = useEvmNativeBalance({
    // chain: process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? EvmChain.ETHEREUM : EvmChain.GOERLI,
    address: smartWalletAddress,
  });
  const {
    data: tokenBalances,
    isFetching: loadingTokenBalances,
    error: tokenBalancesError,
  } = useEvmWalletTokenBalances({
    // chain: process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? EvmChain.ETHEREUM : EvmChain.GOERLI,
    address: smartWalletAddress,
  });

  const { connections, connect, disconnect, isConnecting } = useWalletConnect({
    account: smartWalletAddress,
    chainId: '5',
  });

  const getStateAndBillingCallback = useCallback(() => {
    getState();
    getBillingStatus();
  }, []);

  useEffect(() => {
    getStateAndBillingCallback();
  }, [getStateAndBillingCallback]);

  useEffect(() => {
    if (transactions) setTotalTransactions(sumValues(transactions));
    if (batches) setTotalBatches(sumValues(batches));
  }, [transactions, batches]);

  useEffect(() => {
    if (nativeBalance?.balance.ether !== '0' || tokenBalances?.length === 0)
      setSmartWalletFunded(true);
    else setSmartWalletFunded(false);
  }, [nativeBalance, tokenBalances]);

  /** CONSTANTS */
  const onboardingActiveStep = (): number => {
    // if (!smartWalletFunded) return 0;
    // else if (!billing.emailExists) return 1;
    // else if (billing.paymentMethods > 0) return 2;
    // else return -1;
    return 0;
  };

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
                loading={websocketStatus !== 'Open' || clients?.TOTAL === null}
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidget
                title="Pending Transactions"
                total={transactions?.NEW || 100}
                color="warning"
                loading={websocketStatus !== 'Open' || transactions?.PENDING === null}
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidget
                title="Total Transactions"
                total={totalTransactions || 100}
                color="error"
                loading={websocketStatus !== 'Open' || transactions === null}
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidget
                title="Total Batches"
                total={totalBatches || 100}
                loading={websocketStatus !== 'Open' || batches === null}
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
              />
            </Grid>
          </>
        )}

        {/* Failed Payment Alert */}
        {/* {billing.failedCharges > 0 && (
          <Grid xs={12} md={12}>
            <FailedPaymentAlert
              title={`🚨 You have ${billing.failedCharges} failed payment${
                billing.failedCharges > 1 && 's'
              }`}
              description="Please resolve this failed payment before submitting any new transactions."
              action={
                <Button variant="contained" color="primary" href={APP_STUFF.billingLink}>
                  Update payment methods
                </Button>
              }
            />
          </Grid>
        )} */}

        {/* Get Started */}
        {connectionStatus !== 'connected' && <GetStarted />}

        {connectionStatus === 'connected' && (
          <>
            {/* Onboarding */}
            {onboardingActiveStep() >= 0 && <Onboarding _activeStep={onboardingActiveStep()} />}

            {/* Wallet */}
            {smartWalletFunded && (
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

                {nativeBalance?.balance.ether! > '0' ||
                  (tokenBalances && (
                    <Balances
                      loading={loadingNativeBalance || loadingTokenBalances}
                      error={nativeBalanceError || tokenBalancesError}
                      nativeBalance={parseFloat(nativeBalance?.balance.ether || '0')}
                      tokenBalances={tokenBalances}
                    />
                  ))}

                <WalletConnectModalHandler />
              </Grid>
            )}
          </>
        )}
      </Grid>
    </Container>
  );
}
