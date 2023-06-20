'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

// redux
import { useDispatch } from 'src/redux/store';
import {
  updateClients,
  incrementClients,
  decrementClients,
  updateState,
  updateBilling,
  updateEmail,
  updateUserTransactions,
  newTransaction,
  cancelTransaction,
} from 'src/redux/slices/state';

import { Events } from 'src/types/websocket';
import { useWalletContext } from './WalletContext';

type Props = {
  children: React.ReactNode;
};
type Context = {
  socketUrl: string;
  connectionStatus: ReadyState | string;
  messageHistory: any;
  getState: () => void;
  updateEmail: (email: string) => void;
  newTransaction: (account: string, target: string, value: string, calldata: string) => void;
  updateTransactionPriority: (transactionId: string) => void;
  cancelTransaction: (transactionId: string) => void;
};

const WebsocketContext = createContext<Context | null>(null);

export const WebsocketContextProvider = ({ children }: Props) => {
  /** STATE */
  const [socketUrl] = useState(
    process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
      'wss://phus4hn141.execute-api.us-east-2.amazonaws.com/dev'
  );
  const [messageHistory, setMessageHistory] = useState<any>([]);

  /** HOOKS */
  const dispatch = useDispatch();
  const { smartWallet, smartWalletAddress } = useWalletContext();

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => {
      sendJsonMessage({ action: 'getState', message: '' });
    },
    onClose: () => console.log('closed'),
    onError: (e) => console.error(e),
    shouldReconnect: (closeEvent) => true,
  });

  /** CONSTANTS */
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  /** FUNCTIONS */
  useEffect(() => {
    if (lastJsonMessage !== null) {
      setMessageHistory((prev: any) => prev.concat(lastJsonMessage));

      const { event, data, error }: any = lastJsonMessage;

      if (error) {
      } else {
        switch (event) {
          case Events.SUBSCRIBE:
            dispatch(incrementClients());

            break;

          case Events.UNSUBSCRIBE:
            dispatch(decrementClients());

            break;

          case Events.GET_STATE:
            const { clients, state, transactions, billing } = data;

            dispatch(updateClients({ value: clients }));
            dispatch(updateState({ state }));
            if (billing) dispatch(updateBilling({ billing }));
            dispatch(updateUserTransactions({ transactions }));

            break;

          case Events.UPDATE_EMAIL:
            const { customer } = data;

            dispatch(updateEmail({ email: customer.email }));

            break;

          case Events.NEW_TRANSACTION:
            const { transaction } = data;

            dispatch(newTransaction({ transaction }));

            break;

          case Events.CANCEL_TRANSACTION:
            const { transactionId } = data;

            dispatch(cancelTransaction({ transactionId }));

            break;

          default:
            break;
        }
      }
    }
  }, [lastJsonMessage, setMessageHistory]);

  /** METHODS */

  /**
   * Fetches latest state of Normal
   */
  const _getState = async () => {
    const payload = 'Hello world';
    let message = { address: smartWalletAddress || '', payload };

    let signature = '';
    if (smartWallet) signature = await smartWallet.signMessage(payload);

    sendJsonMessage({
      action: Events.GET_STATE,
      message: {
        ...message,
        signature: signature,
      },
    });
  };

  /**
   * Updates the user's email for Stripe
   * @param email
   */
  const _updateEmail = async (email: string) => {
    if (smartWallet && smartWalletAddress) {
      const payload = { email };
      let message = { address: smartWalletAddress, payload };

      const signature = await smartWallet.signMessage(JSON.stringify(payload));

      sendJsonMessage({
        action: Events.UPDATE_EMAIL,
        message: {
          ...message,
          signature: signature,
        },
      });
    }
  };

  /**
   * Submits a new transaction for batching
   * @param account
   * @param target
   * @param value
   * @param calldata
   */
  const _newTransaction = async (
    account: string,
    target: string,
    value: string,
    calldata: string
  ) => {
    if (smartWallet && smartWalletAddress) {
      const payload = { account, target, value, calldata };
      let message = {
        address: smartWalletAddress,
        payload,
      };

      const signature = await smartWallet.signMessage(JSON.stringify(payload));

      sendJsonMessage({
        action: Events.NEW_TRANSACTION,
        message: {
          ...message,
          signature: signature,
        },
      });
    }
  };

  /**
   *
   * @param transactionId
   */
  const _updateTransactionPriority = async (transactionId: string) => {
    if (smartWallet && smartWalletAddress) {
      const payload = { transactionId };
      let message = { address: smartWalletAddress, payload };

      const signature = await smartWallet.signMessage(JSON.stringify(message));

      sendJsonMessage({
        action: Events.UPDATE_TRANSACTION_PRIORITY,
        message: {
          ...message,
          signature: signature,
        },
      });
    }
  };

  /**
   * Removes a transaction from batching
   * @param transactionId
   */
  const _cancelTransaction = async (transactionId: string) => {
    if (smartWallet && smartWalletAddress) {
      const payload = { transactionId };
      let message = { address: smartWalletAddress, payload };

      const signature = await smartWallet.signMessage(JSON.stringify(message));

      sendJsonMessage({
        action: Events.CANCEL_TRANSACTION,
        message: {
          ...message,
          signature: signature,
        },
      });
    }
  };

  return (
    <WebsocketContext.Provider
      value={{
        socketUrl,
        connectionStatus,
        messageHistory,
        getState: _getState,
        updateEmail: _updateEmail,
        newTransaction: _newTransaction,
        updateTransactionPriority: _updateTransactionPriority,
        cancelTransaction: _cancelTransaction,
      }}
    >
      {children}
    </WebsocketContext.Provider>
  );
};

export const useWebsocketContext = () => {
  const context = useContext(WebsocketContext);

  if (!context)
    throw new Error('WebsocketContext must be called from within the WebsocketContextProvider');

  return context;
};
