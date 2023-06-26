'use client';

import { createContext, useContext, useState, useEffect } from 'react';

import {
  Alchemy,
  AssetTransfersCategory,
  AssetTransfersResult,
  Network,
  OwnedToken,
  TransactionRequest,
} from 'alchemy-sdk';
import { useWalletContext } from './WalletContext';
import { ALCHEMY_API_KEY } from 'src/config-global';
import { Goerli } from '@thirdweb-dev/chains';

type Props = {
  children: React.ReactNode;
};
type Context = {
  loading: boolean;
  alchemy: Alchemy | undefined;
  ethereumBalance: number;
  tokenBalances: OwnedToken[];
  transactions: AssetTransfersResult[];
  refresh: () => void;
  getEthereumBalanceOfAddress: (address: string) => Promise<number>;
  getTokenBalancesOfAddress: (address: string) => Promise<OwnedToken[]>;
  getFeeData: () => Promise<any>;
  getGasEstimate: (transaction: TransactionRequest) => Promise<any>;
};

const UPDATE_INTERVAL = 1000 * 60 * 3; // 3 minutes

const AlchemyContext = createContext<Context | null>(null);

export const AlchemyContextProvider = ({ children }: Props) => {
  const [loading, setLoading] = useState(false);
  const [alchemy, setAlchemy] = useState<Alchemy | undefined>();

  const [ethereumBalance, setEthereumBalance] = useState<number>(0);
  const [tokenBalances, setTokenBalances] = useState<OwnedToken[]>([]);
  const [transactions, setTransactions] = useState<AssetTransfersResult[]>([]);

  const { activeChain, personalWalletAddress, smartWalletAddress } = useWalletContext();

  useEffect(() => {
    if (!alchemy) {
      setAlchemy(
        new Alchemy({
          apiKey: ALCHEMY_API_KEY,
          network: Network.ETH_GOERLI,
        })
      );
    }
  }, [alchemy]);

  useEffect(() => {
    if (activeChain === Goerli) getBalancesAndTransfers();
  }, [smartWalletAddress, activeChain]);

  useEffect(() => {
    const interval = setInterval(getBalancesAndTransfers, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  /**
   * PRIVATE METHODS
   */

  async function getBalancesAndTransfers() {
    if (smartWalletAddress) {
      setLoading(true);
      await getEthereumBalance();
      await getTokenBalances();
      await getAssetTransfers();
      setLoading(false);
    }
  }

  async function getEthereumBalance() {
    if (alchemy) {
      const { _hex } = await alchemy.core.getBalance(smartWalletAddress);
      let ethereum = 0;
      if (_hex) ethereum = parseInt(_hex.toString(), 16) / Math.pow(10, 18);
      setEthereumBalance(ethereum);
    }
  }

  async function getTokenBalances() {
    if (alchemy) {
      const { tokens } = await alchemy.core.getTokensForOwner(smartWalletAddress);
      console.log(tokens)
      if (tokens.length > 0)
        setTokenBalances(tokens.filter((token) => parseFloat(token.balance!) > 0));
    }
  }

  async function getAssetTransfers() {
    if (alchemy) {
      const { transfers: outboungTransfers } = await alchemy.core.getAssetTransfers({
        fromAddress: personalWalletAddress,
        category: [
          AssetTransfersCategory.EXTERNAL,
          AssetTransfersCategory.INTERNAL,
          AssetTransfersCategory.ERC20,
        ],
      });

      const { transfers: incomingTransfers } = await alchemy.core.getAssetTransfers({
        toAddress: personalWalletAddress,
        category: [
          AssetTransfersCategory.EXTERNAL,
          AssetTransfersCategory.INTERNAL,
          AssetTransfersCategory.ERC20,
        ],
      });

      setTransactions([...outboungTransfers, ...incomingTransfers]);
    }
  }

  /**
   * PUBLIC METHODS
   */

  async function refresh() {
    await getBalancesAndTransfers();
  }

  /**
   *
   * @param address
   * @returns
   */
  async function getEthereumBalanceOfAddress(address: string): Promise<number> {
    if (alchemy) {
      const { _hex } = await alchemy.core.getBalance(address);
      let ethereum = 0;
      if (_hex) ethereum = parseInt(_hex.toString(), 16) / Math.pow(10, 18);
      return ethereum;
    } else return 0;
  }

  /**
   *
   * @param address
   * @returns
   */
  async function getTokenBalancesOfAddress(address: string): Promise<OwnedToken[]> {
    if (alchemy) {
      const { tokens } = await alchemy.core.getTokensForOwner(address);
      if (tokens.length > 0) return tokens.filter((token) => parseFloat(token.balance!) > 0);
      else return [];
    } else return [];
  }

  async function getFeeData() {
    return await alchemy?.core.getFeeData();
  }

  async function getGasEstimate(transaction: TransactionRequest) {
    return await alchemy?.core.estimateGas(transaction);
  }

  return (
    <AlchemyContext.Provider
      value={{
        loading,
        alchemy,
        ethereumBalance,
        tokenBalances,
        transactions,
        refresh,
        getEthereumBalanceOfAddress,
        getTokenBalancesOfAddress,
        getFeeData,
        getGasEstimate,
      }}
    >
      {children}
    </AlchemyContext.Provider>
  );
};

export const useAlchemyContext = () => {
  const context = useContext(AlchemyContext);

  if (!context)
    throw new Error('AlchemyContext must be called from within the AlchemyContextProvider');

  return context;
};
