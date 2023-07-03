/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { createContext, useContext, useState, useEffect } from 'react';

import {
  WalletInstance,
  useWallet,
  useConnectionStatus,
  useChain,
  useSwitchChain,
} from '@thirdweb-dev/react';
import { SmartWallet } from '@thirdweb-dev/wallets';
import { Chain, Goerli } from '@thirdweb-dev/chains';
import { THIRDWEB } from 'src/config-global';
import { useSnackbar } from 'src/components/snackbar';
import { AnalyticsEvents, useAnalyticsContext } from './AnalyticsContext';

type Props = {
  children: React.ReactNode;
};
type WalletAddresses = {
  personal: string;
  smart: string;
};
type Context = {
  connectionStatus: 'unknown' | 'connected' | 'disconnected' | 'connecting';
  chain: Chain | undefined;
  switchChain: (chain: number) => Promise<void>;
  personalWallet: WalletInstance | undefined;
  smartWallet: SmartWallet | undefined;
  walletAddresses: WalletAddresses;
  smartWalletDisconnectedError: () => void;
};

const WalletContext = createContext<Context | null>(null);

export const WalletContextProvider = ({ children }: Props) => {
  // Hooks
  const wallet = useWallet();
  const chain = useChain();
  const switchChain = useSwitchChain();
  const connectionStatus = useConnectionStatus();
  const { enqueueSnackbar } = useSnackbar();
  const { setUser, trackEvent } = useAnalyticsContext();

  // State
  const [smartWallet, setSmartWallet] = useState<SmartWallet>();
  const [walletAddresses, setWalletAddresses] = useState<WalletAddresses>({
    personal: '',
    smart: '',
  });

  // When a wallet is connected, connect to its smart wallet
  useEffect(() => {
    if (wallet) {
      trackEvent(AnalyticsEvents.CONNECTED_WALLET, { wallet });
      connectSmartWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  // If a wallet is disconnected, reset all context state
  useEffect(() => {
    if (connectionStatus === 'disconnected') setSmartWallet(undefined);
  }, [connectionStatus]);

  // If both wallets are connected, track user for analytics
  useEffect(() => {
    if (wallet && smartWallet) setUser(walletAddresses.personal, walletAddresses.smart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartWallet]);

  function smartWalletDisconnectedError() {
    enqueueSnackbar('Smart wallet disconnected', { variant: 'error' });
  }

  async function connectSmartWallet() {
    // connect the smart wallet
    const _smartWallet = new SmartWallet({
      chain: Goerli,
      factoryAddress: THIRDWEB.factoryAddress,
      thirdwebApiKey: THIRDWEB.apiKey,
      gasless: false,
    });
    await _smartWallet.connect({ personalWallet: wallet as any });
    setSmartWallet(_smartWallet);

    // save the addresses
    const personalAddress = await wallet!.getAddress();
    const smartAddress = await _smartWallet.getAddress();

    setWalletAddresses({
      personal: personalAddress,
      smart: smartAddress,
    });
  }

  return (
    <WalletContext.Provider
      value={{
        connectionStatus,
        chain,
        switchChain,
        personalWallet: wallet,
        smartWallet,
        walletAddresses,
        smartWalletDisconnectedError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);

  if (!context)
    throw new Error('WalletContext must be called from within the WalletContextProvider');

  return context;
};
