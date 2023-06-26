'use client';

import { useEffect, useState, useCallback } from 'react';

// @mui
import { Button, CircularProgress, Container, Skeleton, Typography } from '@mui/material';
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
import TransactionsOverview from '../transactions';
import { useAlchemyContext } from 'src/contexts/AlchemyContext';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';
import { Goerli } from '@thirdweb-dev/chains';

// ----------------------------------------------------------------------

export default function DashboardView() {
  /** HOOKS */
  const settings = useSettingsContext();
  const { trackEvent } = useAnalyticsContext();

  const { connectionStatus: websocketStatus, getState } = useWebsocketContext();

  const { connectionStatus, chain, switchChain, smartWallet, walletAddresses } = useWalletContext();

  /** REDUX */
  const { clients, transactions, batches, billing, userTransactions } = useSelector(
    (state) => state.state
  );

  /** STATE */
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [smartWalletFunded, setSmartWalletFunded] = useState(false);

  const { ethereumBalance, tokenBalances, loading: alchemyLoading } = useAlchemyContext();

  const { connections, connect, disconnect, isConnecting } = useWalletConnect({
    account: walletAddresses.smart,
    chainId: chain?.chainId!,
  });

  const getStateCallback = useCallback(() => {
    getState();
  }, []);

  useEffect(() => {
    getStateCallback();
  }, [getStateCallback]);

  useEffect(() => {
    if (walletAddresses.smart) getStateCallback();
  }, [walletAddresses.smart]);

  useEffect(() => {
    if (transactions) setTotalTransactions(sumValues(transactions));
    if (batches) setTotalBatches(sumValues(batches));
  }, [transactions, batches]);

  useEffect(() => {
    if (ethereumBalance > 0 || tokenBalances.length > 0) setSmartWalletFunded(true);
    else setSmartWalletFunded(false);
  }, [ethereumBalance, tokenBalances]);

  /** CONSTANTS */
  const onboardingActiveStep = (): number => {
    if (!smartWalletFunded) return 0;
    else if (!billing.email) return 1;
    else if (billing.paymentMethods == 0) return 2;
    else return -1;
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
        Realtime Worldwide 🌎
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics */}
        <>
          {websocketStatus === 'Connecting' ||
            (websocketStatus === 'Closing' && <CircularProgress />)}
          {websocketStatus === 'Closed' ||
            (websocketStatus === 'Uninstantiated' && <h1>Unable to connect to API.</h1>)}
          {websocketStatus === 'Open' && (
            <>
              <Grid xs={12} sm={6} md={3}>
                <AnalyticsWidget
                  title="Connected Clients"
                  total={clients}
                  color="info"
                  loading={websocketStatus !== 'Open' || clients === null}
                  icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
                />
              </Grid>

              <Grid xs={12} sm={6} md={3}>
                <AnalyticsWidget
                  title="Pending Transactions"
                  total={transactions?.NEW + transactions?.PENDING}
                  color="warning"
                  loading={websocketStatus !== 'Open' || transactions?.PENDING === null}
                  icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
                />
              </Grid>

              <Grid xs={12} sm={6} md={3}>
                <AnalyticsWidget
                  title="Total Transactions"
                  total={totalTransactions}
                  color="error"
                  loading={websocketStatus !== 'Open' || transactions === null}
                  icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
                />
              </Grid>

              <Grid xs={12} sm={6} md={3}>
                <AnalyticsWidget
                  title="Total Batches"
                  total={totalBatches}
                  loading={websocketStatus !== 'Open' || batches === null}
                  icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
                />
              </Grid>
            </>
          )}

          {/* Failed Payment Alert */}
          {billing.failedCharges > 0 && (
            <Grid xs={12} md={12}>
              <FailedPaymentAlert
                title={'🚨 You have a failed payment'}
                description="Please resolve before submitting any new transactions."
                action={
                  <Button
                    variant="contained"
                    color="error"
                    href={APP_STUFF.billingLink}
                    onClick={() => trackEvent(AnalyticsEvents.OPENED_BILLING)}
                  >
                    Update payment methods
                  </Button>
                }
              />
            </Grid>
          )}

          {/* Wrong Network */}
          {![1, 5].includes(chain?.chainId!) && (
            <Grid xs={12} md={12}>
              <FailedPaymentAlert
                title={'Wrong network'}
                description="Please switch to Ethereum or Goerli to continue."
                action={
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => switchChain(Goerli.chainId)}
                  >
                    Switch to Ethereum {process.env.NODE_ENV === 'production' && '(Goerli)'}
                  </Button>
                }
              />
            </Grid>
          )}

          {/* Correct Network */}
          {[1, 5].includes(chain?.chainId!) && (
            <>
              {/* Get Started */}
              {connectionStatus !== 'connected' && <GetStarted />}

              {connectionStatus === 'connected' && (
                <>
                  {!smartWallet && (
                    <Grid xs={12} md={12}>
                      <Skeleton height={200} />
                    </Grid>
                  )}

                  {smartWallet && (
                    <>
                      {/* Onboarding */}
                      {onboardingActiveStep() >= 0 ? (
                        <Onboarding activeStep={onboardingActiveStep()} />
                      ) : (
                        <>
                          {/* Live User Transactions */}
                          {Object.keys(userTransactions).length > 0 && (
                            <Grid xs={12}>
                              <TransactionsOverview transactions={userTransactions} />
                            </Grid>
                          )}

                          {/* Wallet */}
                          {smartWalletFunded && (
                            <>
                              <Grid xs={12}>
                                <Header
                                  loading={alchemyLoading}
                                  ethereumBalance={ethereumBalance}
                                  tokenBalances={tokenBalances}
                                />

                                <Dapps
                                  connections={connections}
                                  connect={connect}
                                  disconnect={disconnect}
                                  isWcConnecting={isConnecting}
                                />
                              </Grid>

                              <Grid xs={12}>
                                {smartWalletFunded && (
                                  <Balances
                                    loading={alchemyLoading}
                                    error={false}
                                    ethereumBalance={ethereumBalance}
                                    tokenBalances={tokenBalances}
                                  />
                                )}

                                <WalletConnectModalHandler />
                              </Grid>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </>
      </Grid>
    </Container>
  );
}
