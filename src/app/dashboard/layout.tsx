'use client';

// thirdweb
import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  magicLink,
} from '@thirdweb-dev/react';
import { Goerli, Ethereum } from '@thirdweb-dev/chains';
import { WALLET_CONNECT } from 'src/config-global';

import { IntercomProvider } from 'src/utils/intercom/IntercomProvider';

import { WalletContextProvider } from 'src/contexts/WalletContext';
import { AlchemyContextProvider } from 'src/contexts/AlchemyContext';
import { WebsocketContextProvider } from 'src/contexts/WebsocketContext';
import { AnalyticsContextProvider } from 'src/contexts/AnalyticsContext';

// components
import DashboardLayout from 'src/layouts/dashboard';
ß;
// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <ThirdwebProvider
      activeChain={process.env.NODE_ENV === 'production' ? Ethereum : Goerli}
      autoConnect
      supportedWallets={[
        metamaskWallet(),
        coinbaseWallet(),
        walletConnect({ projectId: WALLET_CONNECT.projectId }),
        magicLink({ apiKey: WALLET_CONNECT.relayUrl, emailLogin: true, smsLogin: true }),
      ]}
    >
      <IntercomProvider>
        <AnalyticsContextProvider>
          <WalletContextProvider>
            <AlchemyContextProvider>
              <WebsocketContextProvider>
                <DashboardLayout>{children}</DashboardLayout>
              </WebsocketContextProvider>
            </AlchemyContextProvider>
          </WalletContextProvider>
        </AnalyticsContextProvider>
      </IntercomProvider>
    </ThirdwebProvider>
  );
}
