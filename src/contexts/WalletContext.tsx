'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { WalletInstance, useWallet, useConnectionStatus } from '@thirdweb-dev/react';
import { SmartWallet } from '@thirdweb-dev/wallets';
import { Ethereum, Goerli } from '@thirdweb-dev/chains';
import { THIRDWEB } from 'src/config-global';

type Props = {
  children: React.ReactNode;
};
type Context = {
  connectionStatus: string;
  personalWallet: WalletInstance;
  smartWallet: SmartWallet;
  personalWalletAddress: string;
  smartWalletAddress: string;
};

const WalletContext = createContext<Context | null>(null);

export const WalletContextProvider = ({ children }: Props) => {
  const wallet = useWallet();
  const connectionStatus = useConnectionStatus();

  const [personalWallet, setPersonalWallet] = useState<WalletInstance>();
  const [smartWallet, setSmartWallet] = useState<SmartWallet>();

  const [personalWalletAddress, setPersonalWalletAddress] = useState<String>('');
  const [smartWalletAddress, setSmartWalletAddress] = useState<String>('');

  // Update wallet addresses
  useEffect(() => {
    if (personalWallet) getPersonalWalletAddress();
    if (smartWallet) getSmartWalletAddress();
  }, [personalWallet, smartWallet]);

  useEffect(() => {
    if (wallet) {
      setPersonalWallet(wallet);
      connectSmartWallet();
    }
  }, [wallet]);

  async function getPersonalWalletAddress() {
    const address = (await personalWallet?.getAddress()) || '';
    setPersonalWalletAddress(address);
  }

  async function getSmartWalletAddress() {
    const address = (await smartWallet?.getAddress()) || '';
    setSmartWalletAddress(address);
  }

  async function connectSmartWallet() {
    // Setup the Smart Wallet configuration
    const config = {
      chain: process.env.NODE_ENV === 'production' ? Ethereum : Goerli,
      factoryAddress: THIRDWEB.factoryAddress,
      thirdwebApiKey: THIRDWEB.apiKey,
      gasless: false,
    };

    // Then, connect the Smart wallet
    const _smartWallet = new SmartWallet(config);
    await _smartWallet.connect({ personalWallet: wallet as any });
    setSmartWallet(_smartWallet);
  }

  return (
    <WalletContext.Provider
      value={{
        connectionStatus,
        personalWallet: personalWallet as any,
        personalWalletAddress: personalWalletAddress as any,
        smartWallet: smartWallet as any,
        smartWalletAddress: smartWalletAddress as any,
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
