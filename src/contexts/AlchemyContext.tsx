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

type Props = {
  children: React.ReactNode;
};
type Context = {
  loading: boolean;
  alchemy: Alchemy | undefined;
  ethereumBalance: number;
  tokenBalances: OwnedToken[];
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
  const [assetTransfers, setAssetTransfers] = useState<Record<string, AssetTransfersResult[]>>({
    outgoing: [],
    incoming: [],
  });

  const { smartWalletAddress } = useWalletContext();

  useEffect(() => {
    if (!alchemy) {
      const _alchemy = new Alchemy({
        apiKey: ALCHEMY_API_KEY,
        network: process.env.NODE_ENV === 'production' ? Network.ETH_MAINNET : Network.ETH_GOERLI,
      });
      setAlchemy(_alchemy);
    }
  }, [alchemy]);

  useEffect(() => {
    getBalancesAndTransfers();
  }, [smartWalletAddress]);

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
    const hexBalance = await alchemy?.core.getBalance(smartWalletAddress);
    let ethereum = 0;
    if (hexBalance) ethereum = parseInt(hexBalance.toString(), 16) / Math.pow(10, 18);
    setEthereumBalance(ethereum);
  }

  async function getTokenBalances() {
    const tokens = await alchemy?.core.getTokensForOwner(smartWalletAddress);
    if (tokens) setTokenBalances(tokens.tokens);
  }

  async function getAssetTransfers() {
    const outgoing = await alchemy?.core.getAssetTransfers({
      fromAddress: smartWalletAddress,
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.INTERNAL,
        AssetTransfersCategory.ERC20,
      ],
    });
    if (outgoing?.transfers) setAssetTransfers({ ...assetTransfers, outgoing: outgoing.transfers });

    const incoming = await alchemy?.core.getAssetTransfers({
      toAddress: smartWalletAddress,
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.INTERNAL,
        AssetTransfersCategory.ERC20,
      ],
    });
    if (incoming?.transfers) setAssetTransfers({ ...assetTransfers, incoming: incoming.transfers });
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
    const hexBalance = await alchemy?.core.getBalance(address);
    let ethereum = 0;
    if (hexBalance) ethereum = parseInt(hexBalance.toString(), 16) / Math.pow(10, 18);
    return ethereum;
  }

  /**
   *
   * @param address
   * @returns
   */
  async function getTokenBalancesOfAddress(address: string): Promise<OwnedToken[]> {
    const tokens = await alchemy?.core.getTokensForOwner(address);
    if (tokens) return tokens.tokens;
    else return [];
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
