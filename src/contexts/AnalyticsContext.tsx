// Modules
import { createContext, ReactNode, useContext } from 'react';
import mixpanel from 'mixpanel-browser';
import { MIXPANEL_PROJECT_TOKEN } from 'src/config-global';

// MixPanel
mixpanel.init(MIXPANEL_PROJECT_TOKEN, {
  debug: process.env.NODE_ENV === 'production' ? false : true,
});

export enum AnalyticsEvents {
  // wallet/network
  CONNECTED_WALLET = 'Connected Wallet',
  SWITCHED_NETWORK = 'Switched Network', // @dev: not implemented
  // onboarding
  DEPOSITED_TOKEN = 'Deposited Token',
  DEPOSITED_TOKENS = 'Deposited Tokens', // @dev: not implemented
  OPENED_BILLING = 'Opened Billing',
  // websocket
  UPDATED_EMAIL = 'Updated Email',
  CREATED_BATCH_TRANSACTION = 'Created Batch Transaction',
  UPDATED_BATCH_TRANSACTION_PRIORITY = 'Updated Batch Transaction Priority',
  CANCELED_BATCH_TRANSACTION = 'Canceled Batch Transaction',
  // random
  COPIED_ADDRESS = 'Copied Address',
  REDIRECTED = 'Redirected',
  UPDATED_AUTO_BATCH = 'Updated Auto Batch', // @dev: not implemented
  // modal
  OPENED_SEND = 'Opened Send',
  OPENED_RECEIVE = 'Opened Receive',
  // crypto action
  SENT_CRYPTO = 'Sent Crypto',
  // walletconnect
  OPENED_CONNECT_DAPP = 'Opened Connect Dapp',
  REQUESTED_CONNECT_DAPP = 'Requested Connect Dapp',
  REJECTED_CONNECT_DAPP = 'Rejected Connect Dapp',
  APPROVED_CONNECT_DAPP = 'Approved Connect Dapp',
  VIEWED_CONNECTED_DAPP = 'Viewed Connected Dapp',
  DISCONNECTED_CONNECTED_DAPP = 'Disconnected Connected Dapp',
  FILTERED_BALANCES_BY_SEARCH = 'Filtered Balances by Search',
  REJECTED_SIGN_MESSAGE = 'Rejected Sign Message',
  APPROVED_SIGN_MESSAGE = 'Approved Sign Message',
  REJECTED_SIGN_TYPED_DATA = 'Rejected Sign Typed Data',
  APPROVED_SIGN_TYPED_DATA = 'Approved Sign Typed Data',
  REJECTED_SIGN_SEND_TRANSACTION = 'Rejected Sign/Send Transaction',
  APPROVED_SIGN_SEND_TRANSACTION = 'Approved Sign/Send Transaction',
  RECEIVED_UNSUPPORTED_WC_METHOD = 'Received Unsupported WalletConnect Method',
  // transactions - blockchain
  FILTERED_BLOCKCHAIN_TRANSACTIONS_BY_STATUS = 'Filtered Blockchain Transactions by Status',
  FILTERED_BLOCKCHAIN_TRANSACTIONS_BY_SEARCH = 'Filtered Blockchain Transactions by Search',
  FILTERED_BLOCKCHAIN_TRANSACTIONS_BY_DATE = 'Filtered Blockchain Transactions by Date',
  SELECTED_BLOCKCHAIN_TRANSACTION = 'Selected Blockchain Transaction',
  COPIED_BLOCKCHAIN_TRANSACTION_HASH = 'Copied Blockchain Transaction Hash',
  VIEWED_BLOCKCHAIN_TRANSACTION_ON_ETHERSCAN = 'Viewed Blockchain Transaction on Etherscan',
  VIEWED_BLOCKCHAIN_TRANSACTION_PROPERTY_ON_ETHERSCAN = 'Viewed Blockchain Transaction Property on Etherscan',
  // transactions - batch
  FILTERED_BATCH_TRANSACTIONS_BY_STATUS = 'Filtered Batch Transactions by Status',
  FILTERED_BATCH_TRANSACTIONS_BY_SEARCH = 'Filtered Batch Transactions by Search',
  FILTERED_BATCH_TRANSACTIONS_BY_DATE = 'Filtered Batch Transactions by Date',
  SELECTED_BATCH_TRANSACTION = 'Selected Batch Transaction',
  COPIED_BATCH_TRANSACTION_HASH = 'Copied Batch Transaction Hash',
  VIEWED_BATCH_TRANSACTION_ON_ETHERSCAN = 'Viewed Batch Transaction on Etherscan',
  VIEWED_BATCH_TRANSACTION_PROPERTY_ON_ETHERSCAN = 'Viewed Batch Transaction Property on Etherscan',
}

type Props = {
  children?: ReactNode;
};

type Context = {
  setUser: (personalWalletAddress: string, smartWalletAddress: string) => void;
  trackEvent: (event: AnalyticsEvents, data?: Record<string, any>) => void;
};

const AnalyticsContext = createContext<Context | null>(null);

export const AnalyticsContextProvider = ({ children }: Props) => {
  /**
   * Set user of session
   * @param user
   */
  const setUser = (personalWalletAddress: string, smartWalletAddress: string) => {
    mixpanel.identify(`${personalWalletAddress}:${smartWalletAddress}`);
  };

  /**
   * Record event trigger
   * @param event
   * @param data
   */
  const trackEvent = (event: AnalyticsEvents, data?: any) => {
    mixpanel.track(event, data || {});
  };

  return (
    <AnalyticsContext.Provider
      value={{
        setUser,
        trackEvent,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);

  if (!context)
    throw new Error('AnalyticsContext must be called from within the AnalyticsContextProvider');

  return context;
};
