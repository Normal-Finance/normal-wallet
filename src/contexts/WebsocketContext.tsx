'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

// redux
import { useDispatch } from 'src/redux/store';
import { getStateSuccess } from 'src/redux/slices/state';

import { Events } from 'src/types/websocket';

type Props = {
  children: React.ReactNode;
};
type Context = {
  socketUrl: string;
  connectionStatus: ReadyState | string;
  messageHistory: any;
  getState: () => void;
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
      console.log(lastJsonMessage);

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
  const getState = () => {
    sendJsonMessage({ action: Events.GET_STATE });
  };

  const newTransaction = (account: string, target: string, value: string, calldata: string) => {
    sendJsonMessage({
      action: Events.NEW_TRANSACTION,
      message: {
        transaction: {
          account,
          target,
          value,
          calldata,
        },
      },
    });
  };

  const cancelTransaction = (transactionId: string) => {
    sendJsonMessage({
      action: Events.CANCEL_TRANSACTION,
      message: { transactionId: transactionId },
    });
  };

  return (
    <WebsocketContext.Provider
      value={{
        socketUrl,
        connectionStatus,
        messageHistory,
        getState,
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
