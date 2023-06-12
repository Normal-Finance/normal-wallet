import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
// import { useToasts } from 'hooks/toasts'

// redux
import { useDispatch, useSelector } from 'src/redux/store';

// import WalletConnectCore from 'walletconnect-legacy-core'
// import * as cryptoLib from 'walletconnect-legacy-iso-crypto'
import LegacySignClient from '@walletconnect/client';
import { IWalletConnectSession } from '@walletconnect/legacy-types';

import { UNISWAP_PERMIT_EXCEPTIONS, WC1_SUPPORTED_METHODS } from './wcConsts';
import {
  batchRequestsAdded,
  connectedNewSession,
  disconnected,
  requestAdded,
  requestsResolved,
} from 'src/redux/slices/wcLegacy';

const noop = () => null;
const noopSessionStorage = { setSession: noop, getSession: noop, removeSession: noop };

const STORAGE_KEY = 'wc1_state';
const SESSION_TIMEOUT = 10000;

let connectors: any = {};
let connectionErrors: any = [];

async function wait(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Offline check: if it errored recently
const timePastForConnectionErr = 90 * 1000;
const checkIsOffline = (connectionId: any) => {
  const errors = connectionErrors.filter((x: any) => x.connectionId === connectionId);
  // if no errors, return false, else check time diff
  return (
    errors.length > 0 &&
    errors.find(({ time }: any = {}) => time > Date.now() - timePastForConnectionErr)
  );
};

export default function useWalletConnectLegacy({
  account,
  chainId,
  clearWcClipboard,
  useStorage,
  setRequests,
}: any) {
  //   const { networks } = useToasts()

  // This is needed cause of the WalletConnect event handlers
  const stateRef: any = useRef();
  stateRef.current = { account, chainId };

  const { connections, requests } = useSelector((state) => state.wcLegacy);
  const dispatch = useDispatch();

  const [isConnecting, setIsConnecting] = useState(false);

  // Side effects that will run on every state change/rerender
  const maybeUpdateSessions = () => {
    // restore connectors and update the ones that are stale
    let updateConnections = false;
    connections.forEach(({ connectionId, isOffline }: any) => {
      if (connectors[connectionId]) {
        const connector = connectors[connectionId];
        const session = connector.session;
        if (
          session.accounts[0] !== account ||
          session.chainId !== chainId ||
          checkIsOffline(connectionId) !== isOffline
        ) {
          // NOTE: in case isOffline is different, we do not need to do this, but we're gonna leave that just in case the session is outdated anyway
          connector.updateSession({ accounts: [account], chainId });
          updateConnections = true;
        }
      }
    });

    // setStateStorage(state)
    setRequests((currRe: any) => [...currRe, ...requests]);

    if (updateConnections)
      dispatch({
        type: 'updateConnections',
        connections: connections
          .filter(({ connectionId }: any) => connectors[connectionId])
          .map(({ connectionId }: any) => ({
            connectionId,
            session: connectors[connectionId].session,
            isOffline: checkIsOffline(connectionId),
          })),
      });
  };
  useEffect(maybeUpdateSessions, [account, chainId, setRequests]);
  // we need this so we can invoke the latest version from any event handler
  stateRef.current.maybeUpdateSessions = maybeUpdateSessions;

  // New connections
  const connect = useCallback(
    async (connectorOpts: any) => {
      const connectionIdentifier = connectorOpts.uri;

      if (connectors[connectionIdentifier]) {
        console.log('dApp already connected');
        return connectors[connectionIdentifier];
      }
      let connector: any;
      try {
        // connector = connectors[connectionIdentifier] = new WalletConnectCore({
        //   connectorOpts,
        //   cryptoLib,
        //   sessionStorage: noopSessionStorage
        // })
        if (connectionIdentifier) {
          deleteCachedLegacySession();
          connector = new LegacySignClient({ uri: connectionIdentifier });
        } else if (!connector && getCachedLegacySession()) {
          const session = getCachedLegacySession();
          connector = new LegacySignClient({ session });
        }

        if (!connector.connected) {
          await connector.createSession();
        }
      } catch (e) {
        console.error(e);
        console.log(`Unable to connect to ${connectionIdentifier}: ${e.message}`, { error: true });
        return null;
      }

      const onError = (err: any) => {
        console.log(
          `WalletConnect error: ${
            connector.session && connector.session.peerMeta && connector.session.peerMeta.name
          } ${err.message || err}`,
          { error: true }
        );
        console.error('WC1 error', err);
      };

      let sessionStart: any;
      let sessionTimeout: any;
      if (!connector.session.peerMeta)
        sessionTimeout = setTimeout(() => {
          const suggestion = /https:\/\/bridge.walletconnect.org/g.test(connector.session.bridge)
            ? // @TODO: 'or try an alternative connection method' when we implement one
              'this dApp is using an old version of WalletConnect - please tell them to upgrade!'
            : 'perhaps the link has expired? Refresh the dApp and try again.';
          if (!connector.session.peerMeta)
            console.log(`Unable to get session from dApp - ${suggestion}`, { error: true });
        }, SESSION_TIMEOUT);

      connector.on('session_request', async (error: any, payload: any) => {
        if (error) {
          onError(error);
          return;
        }

        setIsConnecting(true);

        // Clear the "dApp tool too long to connect" timeout
        clearTimeout(sessionTimeout);

        await wait(1000);

        // sessionStart is used to check if dApp disconnected immediately
        sessionStart = Date.now();
        connector.approveSession({
          accounts: [stateRef.current.account],
          chainId: stateRef.current.chainId,
        });

        await wait(1000);

        // On a session request, remove WC uri from the clipboard.
        // Otherwise, in the case the user disconnects himself from the dApp, but still having the previous WC uri in the clipboard,
        // then the app will try to connect him with the already invalidated WC uri.
        clearWcClipboard();

        // We need to make sure that we are connected to the dApp successfully,
        // before keeping the session as connected via `connectedNewSession` dispatch.
        // We had a case with www.chargedefi.fi, where we were immediately disconnected on a session_request,
        // because of unsupported network selected on our end,
        // but still storing the session in the state as a successful connection, which resulted in app crashes.
        if (!connector.connected) {
          setIsConnecting(false);

          return;
        }

        // It's safe to read .session right after approveSession because 1) approveSession itself normally stores the session itself
        // 2) connector.session is a getter that re-reads private properties of the connector; those properties are updated immediately at approveSession
        dispatch(
          connectedNewSession({
            connectionId: connectorOpts.uri,
            //uri: connectionIdentifier,// TODO check if we still need that
            session: connector.session,
          })
        );

        console.log('Successfully connected to ' + connector.session.peerMeta.name);

        setIsConnecting(false);
      });

      connector.on('transport_error', (error: any, payload: any) => {
        console.error('WC1: transport error', payload);
        connectionErrors.push({
          connectionId: connectionIdentifier,
          event: payload.event,
          time: Date.now(),
        });
        // Keep the last 690 only
        connectionErrors = connectionErrors.slice(-690);
        stateRef.current.maybeUpdateSessions();
      });

      connector.on('call_request', (error: any, payload: any) => {
        if (error) {
          onError(error);
          return;
        }

        if (!WC1_SUPPORTED_METHODS.includes(payload.method)) {
          console.log(`dApp requested unsupported method: ${payload.method}`, { error: true });
          connector.rejectRequest({
            id: payload.id,
            error: { message: 'Method not found: ' + payload.method, code: -32601 },
          });
          return;
        }

        const dappName = connector.session?.peerMeta?.name || '';

        // @TODO: refactor into wcRequestHandler
        // Opensea "unlock currency" hack; they use a stupid MetaTransactions system built into WETH on Polygon
        // There's no point of this because the user has to sign it separately as a tx anyway; but more importantly,
        // it breaks Ambire and other smart wallets cause it relies on ecrecover and does not depend on EIP1271
        let txn = payload.params[0];
        if (payload.method === 'eth_signTypedData') {
          // @TODO: try/catch the JSON parse?
          const signPayload = JSON.parse(payload.params[1]);
          payload = {
            ...payload,
            method: 'eth_signTypedData',
          };
          txn = signPayload;
          if (signPayload.primaryType === 'MetaTransaction') {
            payload = {
              ...payload,
              method: 'eth_sendTransaction',
            };
            txn = [
              {
                to: signPayload.domain.verifyingContract,
                from: signPayload.message.from,
                data: signPayload.message.functionSignature, // @TODO || data?
                value: signPayload.message.value || '0x0',
              },
            ];
          }
        }
        if (payload.method === 'eth_signTypedData_v4') {
          // @TODO: try/catch the JSON parse?
          const signPayload = JSON.parse(payload.params[1]);
          payload = {
            ...payload,
            method: 'eth_signTypedData_v4',
          };
          txn = signPayload;
          // Dealing with Erc20 Permits
          if (signPayload.primaryType === 'Permit') {
            // If Uniswap, reject the permit and expect a graceful fallback (receiving approve eth_sendTransaction afterwards)
            if (
              UNISWAP_PERMIT_EXCEPTIONS.some((ex) =>
                dappName.toLowerCase().includes(ex.toLowerCase())
              )
            ) {
              connector.rejectRequest({
                id: payload.id,
                error: { message: 'Method not found: ' + payload.method, code: -32601 },
              });
              return;
            } else {
              console.log(
                `dApp tried to sign a token permit which does not support Smart Wallets`,
                { error: true }
              );
              return;
            }
          }
        }
        if (
          payload.method === 'gs_multi_send' ||
          payload.method === 'ambire_sendBatchTransaction'
        ) {
          dispatch(
            batchRequestsAdded({
              batchRequest: {
                id: payload.id,
                dateAdded: new Date().valueOf(),
                type: payload.method,
                connectionId: connectionIdentifier,
                txns: payload.params,
                chainId: connector.session?.chainId,
                account: connector.session?.accounts[0],
                notification: true,
              },
            })
          );
          return;
        }
        //FutureProof? WC does not implement it yet
        //   if (payload.method === 'wallet_switchEthereumChain') {
        //     const supportedNetwork = allNetworks.find(a => a.chainId === parseInt(payload.params[0].chainId, 16))

        //     if (supportedNetwork) {
        //       setNetwork(supportedNetwork.chainId)
        //       connector.approveRequest({ id: payload.id, result: { chainId: supportedNetwork.chainId } })
        //     } else {
        //       //Graceful error for user
        //       console.log(`dApp asked to switch to an unsupported chain: ${payload.params[0]?.chainId}`, { error: true })
        //       connector.rejectRequest({ id: payload.id, error: { message: 'Unsupported chain' } })
        //     }
        //   }

        const wrongAcc =
          (payload.method === 'eth_sendTransaction' &&
            payload.params[0] &&
            payload.params[0].from &&
            payload.params[0].from.toLowerCase() !==
              connector.session?.accounts[0].toLowerCase()) ||
          (payload.method === 'eth_sign' &&
            payload.params[1] &&
            payload.params[1].toLowerCase() !== connector.session?.accounts[0].toLowerCase());
        if (wrongAcc) {
          console.log(`dApp sent a request for the wrong account: ${payload.params[0].from}`, {
            error: true,
          });
          connector.rejectRequest({
            id: payload.id,
            error: { message: 'Sent a request for the wrong account' },
          });
          return;
        }
        dispatch(
          requestAdded({
            request: {
              id: payload.id,
              dateAdded: new Date().valueOf(),
              type: payload.method,
              connectionId: connectionIdentifier,
              txn,
              chainId: connector.session?.chainId,
              account: connector.session?.accounts[0],
              notification: true,
              dapp: connector.session?.peerMeta
                ? {
                    name: connector.session.peerMeta.name,
                    description: connector.session.peerMeta.description,
                    icons: connector.session.peerMeta.icons,
                    url: connector.session.peerMeta.url,
                  }
                : null,
            },
          })
        );
      });

      connector.on('disconnect', (error: any, payload: any) => {
        if (error) {
          onError(error);
          return;
        }

        clearTimeout(sessionTimeout);
        // NOTE the dispatch() will cause double rerender when we trigger a disconnect,
        // cause we will call it once on disconnect() and once when the event arrives
        // we can prevent this by checking if (!connectors[...]) but we'd rather stay safe and ensure
        // the connection is removed
        dispatch(disconnected({ connectionId: connectionIdentifier }));

        connectors[connectionIdentifier] = null;

        // NOTE: this event might be invoked 2 times when the dApp itself disconnects
        // currently we don't dedupe that
        if (sessionStart && Date.now() - sessionStart < SESSION_TIMEOUT) {
          console.log(
            'dApp disconnected immediately - perhaps it does not support the current network?',
            { error: true }
          );
        } else {
          console.log(
            `${connector.session?.peerMeta.name} disconnected: ${payload.params[0].message}`
          );
        }
      });

      connector.on('error', onError);

      return connector;
    },
    [clearWcClipboard]
  );

  const disconnect = useCallback((connectionId: any) => {
    // connector might not be there, either cause we disconnected before,
    // or cause we failed to connect in the first place
    if (connectors[connectionId]) {
      connectors[connectionId].killSession();
      connectors[connectionId] = null;
    }
    dispatch(disconnected({ connectionId: connectionId }));
  }, []);

  const resolveMany = (ids: any, resolution: any) => {
    if (ids === undefined) return;
    requests.forEach(({ id, connectionId, isBatch }: any) => {
      if (ids.includes(id)) {
        const connector = connectors[connectionId];
        if (!connector) return;
        if (!isBatch || id.endsWith(':0')) {
          let realId = isBatch ? id.substr(0, id.lastIndexOf(':')) : id;
          if (resolution.success)
            connector.approveRequest({ id: realId, result: resolution.result });
          else connector.rejectRequest({ id: realId, error: { message: resolution.message } });
        }
      }
    });
    dispatch(requestsResolved({ ids: ids }));
  };

  // Side effects on init
  useEffect(() => {
    connections.forEach(({ connectionId, session }: any) => {
      if (!connectors[connectionId]) connect({ connectionId, session });
    });
    // we specifically want to run this only once despite depending on state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect]);

  return {
    connections: connections,
    requests: requests,
    resolveMany,
    connect,
    disconnect,
    isConnecting,
  };
}

function getCachedLegacySession(): IWalletConnectSession | undefined {
  if (typeof window === 'undefined') return;

  const local = window.localStorage ? window.localStorage.getItem('walletconnect') : null;

  let session = null;
  if (local) {
    try {
      session = JSON.parse(local);
    } catch (error) {
      throw error;
    }
  }
  return session;
}

function deleteCachedLegacySession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('walletconnect');
}
