'use client';

// thirdweb
import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  magicLink,
  smartWallet,
} from '@thirdweb-dev/react';
import { Goerli, Ethereum } from '@thirdweb-dev/chains';
import { THIRDWEB, WALLET_CONNECT } from 'src/config-global';

// components
import DashboardLayout from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <ThirdwebProvider
      activeChain={Goerli}
      autoConnect
      supportedWallets={[
        smartWallet({
          factoryAddress: THIRDWEB.factoryAddress,
          thirdwebApiKey: THIRDWEB.apiKey,
          gasless: false,
          personalWallets: [
            metamaskWallet(),
            coinbaseWallet(),
            walletConnect({ projectId: WALLET_CONNECT.projectId }),
            magicLink({ apiKey: WALLET_CONNECT.relayUrl, emailLogin: true, smsLogin: true }),
          ],
        }),
      ]}
    >
      <DashboardLayout>{children}</DashboardLayout>
    </ThirdwebProvider>
  );
}
