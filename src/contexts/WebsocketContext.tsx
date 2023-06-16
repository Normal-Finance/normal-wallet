'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

// redux
import { useDispatch } from 'src/redux/store';
import { getStateSuccess } from 'src/redux/slices/state';

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
  cancelTransaction: (transactionId: string) => void;
};

const WebsocketContext = createContext<Context | null>(null);

export const WebsocketContextProvider = ({ children }: Props) => {
  /** STATE */
  const [socketUrl, setSocketUrl] = useState(
    process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
      'wss://phus4hn141.execute-api.us-east-2.amazonaws.com/dev'
  );
  const [messageHistory, setMessageHistory] = useState<any>([]);

  /** HOOKS */
  const dispatch = useDispatch();
  const { smartWallet, smartWalletAddress } = useWalletContext();

  const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } = useWebSocket(socketUrl, {
    onOpen: () => {
      console.log('opened');
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

      const { event, channelId, content }: any = lastJsonMessage;

      switch (event) {
        case Events.GET_STATE:
          dispatch(getStateSuccess(content));
          break;

        case Events.NEW_TRANSACTION:
          // TODO: parse respose and handle conditionally...requires payment, failed, success
          break;

        case Events.CANCEL_TRANSACTION:
          break;

        default:
          break;
      }
    }
  }, [lastJsonMessage, setMessageHistory]);

  /** METHODS */

  /**
   * Fetches latest state of Normal
   */
  const getState = () => {
    sendJsonMessage({ action: Events.GET_STATE });
  };

  /**
   * Updates the user's email for Stripe
   * @param email
   */
  const updateEmail = async (email: string) => {
    if (smartWallet && smartWalletAddress) {
      var message = { address: smartWalletAddress, email: email };
      const signature = await smartWallet.signMessage(JSON.stringify(message));
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
  const newTransaction = async (
    account: string,
    target: string,
    value: string,
    calldata: string
  ) => {
    if (smartWallet && smartWalletAddress) {
      var message = {
        address: smartWalletAddress,
        transaction: {
          account,
          target,
          value,
          calldata,
        },
      };
      const signature = await smartWallet.signMessage(JSON.stringify(message));
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
   * Removes a transaction from batching
   * @param transactionId
   */
  const cancelTransaction = async (transactionId: string) => {
    if (smartWallet && smartWalletAddress) {
      var message = { address: smartWalletAddress, transactionId: transactionId };
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
        getState,
        updateEmail,
        newTransaction,
        cancelTransaction,
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
