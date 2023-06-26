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
import { useSnackbar } from 'src/components/snackbar';

type Props = {
  children: React.ReactNode;
};
type Context = {
  loading: boolean;
  ethereumBalance: number;
  tokenBalances: OwnedToken[];
  transactions: AssetTransfersResult[];
  refresh: () => void;
  getEthereumBalanceOfAddress: (address: string) => Promise<number> | any;
  getTokenBalancesOfAddress: (address: string) => Promise<OwnedToken[]> | any;
  getFeeData: () => Promise<any>;
  getGasEstimate: (transaction: TransactionRequest) => Promise<any> | any;
};

const UPDATE_INTERVAL = 1000 * 60 * 3; // 3 minutes

const alchemy: Alchemy = new Alchemy({
  apiKey: ALCHEMY_API_KEY,
  network: Network.ETH_GOERLI,
});

const AlchemyContext = createContext<Context | null>(null);

export const AlchemyContextProvider = ({ children }: Props) => {
  // Hooks
  const { enqueueSnackbar } = useSnackbar();
  const { chain, smartWallet, smartWalletDisconnectedError } = useWalletContext();

  // State
  const [loading, setLoading] = useState(false);
  const [ethereumBalance, setEthereumBalance] = useState<number>(0);
  const [tokenBalances, setTokenBalances] = useState<OwnedToken[]>([]);
  const [transactions, setTransactions] = useState<AssetTransfersResult[]>([]);

  // If the smart wallet or chain is changed, update balances and transactions
  useEffect(() => {
    if (smartWallet || chain) getBalancesAndTransactions();
  }, [smartWallet, chain]);

  // Update the balances and transactions every UPDATE_INTERVAL (3 minutes)
  useEffect(() => {
    const interval = setInterval(getBalancesAndTransactions, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  /**
   * UTILS
   */
  const alchemyConnectionError = () => {
    enqueueSnackbar('Unable to connect to Alchemy client', { variant: 'error' });
  };

  const alchemyError = (message: string, error: any) => {
    enqueueSnackbar(message, { variant: 'error' });
  };

  /**
   * PRIVATE METHODS
   */

  function reset() {
    setEthereumBalance(0);
    setTokenBalances([]);
    setTransactions([]);
  }

  async function getAddress() {
    return (await smartWallet?.getAddress()) || '';
  }

  async function getBalancesAndTransactions() {
    setLoading(true);
    reset();
    await getEthereumBalance();
    await getTokenBalances();
    await getTransactions();
    setLoading(false);
  }

  async function getEthereumBalance() {
    if (!alchemy) alchemyConnectionError();
    else if (!smartWallet) smartWalletDisconnectedError();
    else {
      try {
        const address = await getAddress();
        const { _hex } = await alchemy.core.getBalance(address);
        let ethereum = 0;
        if (_hex) ethereum = parseInt(_hex.toString(), 16) / Math.pow(10, 18);
        setEthereumBalance(ethereum);
      } catch (error) {
        alchemyError('Unable to fetch Ethereum balance', error);
      }
    }
  }

  async function getTokenBalances() {
    if (!alchemy) alchemyConnectionError();
    else if (!smartWallet) smartWalletDisconnectedError();
    else {
      try {
        const address = await smartWallet.getAddress();
        const { tokens } = await alchemy.core.getTokensForOwner(address);
        if (tokens.length > 0)
          setTokenBalances(tokens.filter((token) => parseFloat(token.balance!) > 0));
      } catch (error) {
        alchemyError('Unable to fetch Ethereum balance', error);
      }
    }
  }

  async function getTransactions() {
    if (!alchemy) alchemyConnectionError();
    else if (!smartWallet) smartWalletDisconnectedError();
    else {
      try {
        const address = await smartWallet.getAddress();
        if (address) {
          const { transfers: outboungTransfers } = await alchemy.core.getAssetTransfers({
            fromAddress: address,
            category: [
              AssetTransfersCategory.EXTERNAL,
              AssetTransfersCategory.INTERNAL,
              AssetTransfersCategory.ERC20,
            ],
          });

          const { transfers: incomingTransfers } = await alchemy.core.getAssetTransfers({
            toAddress: address,
            category: [
              AssetTransfersCategory.EXTERNAL,
              AssetTransfersCategory.INTERNAL,
              AssetTransfersCategory.ERC20,
            ],
          });

          setTransactions([...outboungTransfers, ...incomingTransfers]);
        }
      } catch (error) {
        alchemyError('Unable to transaction history', error);
      }
    }
  }

  /**
   * PUBLIC METHODS
   */

  async function refresh() {
    await getBalancesAndTransactions();
  }

  /**
   *
   * @param address
   * @returns
   */
  async function getEthereumBalanceOfAddress(address: string) {
    if (!alchemy) alchemyConnectionError();
    else if (!smartWallet) smartWalletDisconnectedError();
    else {
      try {
        const { _hex } = await alchemy.core.getBalance(address);
        let ethereum = 0;
        if (_hex) ethereum = parseInt(_hex.toString(), 16) / Math.pow(10, 18);
        return ethereum;
      } catch (error) {
        alchemyError('Unable to get Ethereum balance', error);
      }
    }
  }

  /**
   *
   * @param address
   * @returns
   */
  async function getTokenBalancesOfAddress(address: string) {
    if (!alchemy) alchemyConnectionError();
    else if (!smartWallet) smartWalletDisconnectedError();
    else {
      try {
        const { tokens } = await alchemy.core.getTokensForOwner(address);
        if (tokens.length > 0) return tokens.filter((token) => parseFloat(token.balance!) > 0);
        else return [];
      } catch (error) {
        alchemyError('Unable to fetch token balances', error);
      }
    }
  }

  async function getFeeData() {
    if (!alchemy) alchemyConnectionError();
    else if (!smartWallet) smartWalletDisconnectedError();
    else {
      try {
        return await alchemy.core.getFeeData();
      } catch (error) {
        alchemyError('Unable to get fee data', error);
      }
    }
  }

  async function getGasEstimate(transaction: TransactionRequest) {
    if (!alchemy) alchemyConnectionError();
    else if (!smartWallet) smartWalletDisconnectedError();
    else {
      try {
        return await alchemy.core.estimateGas(transaction);
      } catch (error) {
        alchemyError('Unable to estimate gas', error);
      }
    }
  }

  return (
    <AlchemyContext.Provider
      value={{
        loading,
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
