/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
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
  updateTransactionPriority,
} from 'src/redux/slices/state';

import { Events } from 'src/types/websocket';
import { TransactionPriority } from 'src/types/transaction';
import { useSnackbar } from 'src/components/snackbar';

import { captureException } from '@sentry/nextjs';
import { AnalyticsEvents, useAnalyticsContext } from './AnalyticsContext';
import { useWalletContext } from './WalletContext';

type Props = {
  children: React.ReactNode;
};
type Context = {
  connectionStatus: ReadyState | string;
  messageHistory: any;
  getState: () => void;
  updateEmail: (email: string) => void;
  newTransaction: (
    account: string,
    target: string,
    value: string,
    calldata: string,
    priority: TransactionPriority
  ) => Promise<boolean>;
  updateTransactionPriority: (transactionId: string, priority: TransactionPriority) => void;
  cancelTransaction: (transactionId: string) => void;
};

const WebsocketContext = createContext<Context | null>(null);

export const WebsocketContextProvider = ({ children }: Props) => {
  // State
  const [messageHistory, setMessageHistory] = useState<any>([]);

  // Hooks
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { smartWallet } = useWalletContext();
  const { trackEvent } = useAnalyticsContext();

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    process.env.NEXT_PUBLIC_WEBSOCKET_URL || '',
    {
      onOpen: () => {
        sendJsonMessage({ action: 'getState' });
      },
      onError: (e) => captureException(e),
      shouldReconnect: (closeEvent) => true,
    }
  );

  // Constants
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  };

  /**
   * UTILS
   */
  const websocketNotOpenError = () => {
    enqueueSnackbar('Disconnected from Websocket API', { variant: 'error' });
  };

  const walletNotConnectedError = () => {
    enqueueSnackbar('No wallet connected', { variant: 'error' });
  };

  const generalError = (message: string, error: any) => {
    enqueueSnackbar(message, { variant: 'error' });
  };

  // When a message is received, parse and handle it
  useEffect(() => {
    if (lastJsonMessage !== null) {
      setMessageHistory((prev: any) => prev.concat(lastJsonMessage));

      const { event, data, error }: any = lastJsonMessage;

      if (error) {
        // TODO:
      } else {
        switch (event) {
          case Events.SUBSCRIBE:
            dispatch(incrementClients());

            break;

          case Events.UNSUBSCRIBE:
            dispatch(decrementClients());

            break;

          case Events.GET_STATE: {
            const {
              clients: { data: clientsData, error: clientsError },
              state: { data: stateData, error: stateError },
              transactions: { data: transactionsData, error: transactionsError },
              billing: { data: billingData, error: billingError },
            } = data;

            // Clients
            if (!clientsError) dispatch(updateClients({ clients: clientsData }));

            // State
            if (!stateError && stateData)
              dispatch(updateState({ transaction: stateData.transaction, batch: stateData.batch }));

            // Billing
            if (!billingError && billingData && Object.keys(billingData).length > 0)
              dispatch(updateBilling({ billing: billingData }));

            // User Transactions
            if (!transactionsError)
              dispatch(updateUserTransactions({ transactions: transactionsData }));

            break;
          }
          case Events.UPDATE_STATE:
            dispatch(updateState({ transaction: data.transaction, batch: data.batch }));

            break;

          case Events.UPDATE_EMAIL:
            dispatch(updateEmail({ email: data.customer.email }));

            break;

          case Events.NEW_TRANSACTION:
            dispatch(newTransaction({ transaction: data.transaction }));

            break;

          case Events.UPDATE_TRANSACTION_PRIORITY:
            if (data.updated)
              dispatch(updateTransactionPriority({ transactionId: data.transactionId }));

            break;

          case Events.CANCEL_TRANSACTION: {
            const { transactionId } = data;

            dispatch(cancelTransaction({ transactionId }));

            break;
          }

          default:
            break;
        }
      }
    }
  }, [lastJsonMessage, setMessageHistory]);

  /**
   * Fetches latest state of Normal
   */
  const _getState = async () => {
    if (readyState === ReadyState.OPEN) {
      try {
        const payload = 'Hello world';
        const address = (await smartWallet?.getAddress()) || '';
        const message = { address, payload };

        const signature = '123';
        // if (smartWallet) signature = await smartWallet.signMessage(payload);

        sendJsonMessage({
          action: Events.GET_STATE,
          message: {
            ...message,
            signature,
          },
        });
      } catch (error) {
        generalError('Unable to get app state', error);
      }
    }
  };

  /**
   * Updates the user's email for Stripe
   * @param email
   */
  const _updateEmail = async (email: string) => {
    if (readyState !== ReadyState.OPEN) websocketNotOpenError();
    else if (!smartWallet) walletNotConnectedError();
    else {
      try {
        const payload = { email };
        const address = await smartWallet.getAddress();
        const message = { address, payload };

        const signature = await smartWallet.signMessage(JSON.stringify(payload));

        sendJsonMessage({
          action: Events.UPDATE_EMAIL,
          message: {
            ...message,
            signature,
          },
        });

        trackEvent(AnalyticsEvents.UPDATED_EMAIL, { email });
      } catch (error) {
        generalError('Unable to update email', error);
      }
    }
  };

  /**
   * Submits a new transaction for batching
   * @param account
   * @param target
   * @param value
   * @param calldata
   * @param priority
   */
  const _newTransaction = async (
    account: string,
    target: string,
    value: string,
    calldata: string,
    priority: TransactionPriority
  ) => {
    if (readyState !== ReadyState.OPEN) {
      websocketNotOpenError();
      return false;
    }
    if (!smartWallet) {
      walletNotConnectedError();
      return false;
    }
    try {
      const transaction = { account, target, value, calldata };
      const payload = { transaction, priority };
      const address = await smartWallet.getAddress();
      const message = {
        address,
        payload,
      };

      const signature = await smartWallet.signMessage(JSON.stringify(payload));

      sendJsonMessage({
        action: Events.NEW_TRANSACTION,
        message: {
          ...message,
          signature,
        },
      });

      trackEvent(AnalyticsEvents.CREATED_BATCH_TRANSACTION, { transaction });

      return true;
    } catch (error) {
      generalError('Unable to submit new transaction', error);
      return false;
    }
  };

  /**
   *
   * @param transactionId
   */
  const _updateTransactionPriority = async (
    transactionId: string,
    priority: TransactionPriority
  ) => {
    if (readyState !== ReadyState.OPEN) websocketNotOpenError();
    else if (!smartWallet) walletNotConnectedError();
    else {
      try {
        const payload = { transactionId, priority };
        const address = await smartWallet.getAddress();
        const message = { address, payload };

        const signature = await smartWallet.signMessage(JSON.stringify(message));

        sendJsonMessage({
          action: Events.UPDATE_TRANSACTION_PRIORITY,
          message: {
            ...message,
            signature,
          },
        });

        trackEvent(AnalyticsEvents.UPDATED_BATCH_TRANSACTION_PRIORITY, { transactionId });
      } catch (error) {
        generalError('Unable to update transaction priority', error);
      }
    }
  };

  /**
   * Removes a transaction from batching
   * @param transactionId
   */
  const _cancelTransaction = async (transactionId: string) => {
    if (readyState !== ReadyState.OPEN) websocketNotOpenError();
    else if (!smartWallet) walletNotConnectedError();
    else {
      try {
        const payload = { transactionId };
        const address = await smartWallet.getAddress();
        const message = { address, payload };

        const signature = await smartWallet.signMessage(JSON.stringify(message));

        sendJsonMessage({
          action: Events.CANCEL_TRANSACTION,
          message: {
            ...message,
            signature,
          },
        });

        trackEvent(AnalyticsEvents.CANCELED_BATCH_TRANSACTION, { transactionId });
      } catch (error) {
        generalError('Unable to cancel transaction', error);
      }
    }
  };

  return (
    <WebsocketContext.Provider
      value={{
        connectionStatus: connectionStatus[readyState],
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
