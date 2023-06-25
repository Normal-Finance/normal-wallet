'use client';

// thirdweb
import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  magicLink,
} from '@thirdweb-dev/react';
import { Goerli } from '@thirdweb-dev/chains';
import { NORMAL_WALLET_INFO, THIRDWEB, WALLET_CONNECT } from 'src/config-global';

import { IntercomProvider } from 'src/utils/intercom/IntercomProvider';

import { WalletContextProvider } from 'src/contexts/WalletContext';
import { AlchemyContextProvider } from 'src/contexts/AlchemyContext';
import { WebsocketContextProvider } from 'src/contexts/WebsocketContext';
import { AnalyticsContextProvider } from 'src/contexts/AnalyticsContext';

// components
import DashboardLayout from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <ThirdwebProvider
      thirdwebApiKey={THIRDWEB.apiKey}
      dAppMeta={{
        name: NORMAL_WALLET_INFO.name,
        url: NORMAL_WALLET_INFO.url,
        description: NORMAL_WALLET_INFO.description,
        logoUrl: NORMAL_WALLET_INFO.logo,
      }}
      supportedChains={[Goerli]}
      activeChain={Goerli}
      autoConnect
      autoSwitch
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
