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
import { WalletContextProvider } from 'src/contexts/WalletContext';
import { IntercomProvider } from 'src/utils/intercom/IntercomProvider';

// components
import DashboardLayout from 'src/layouts/dashboard';

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
        <WalletContextProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </WalletContextProvider>
      </IntercomProvider>
    </ThirdwebProvider>
  );
}
