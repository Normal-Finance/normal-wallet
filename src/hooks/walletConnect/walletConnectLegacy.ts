import { useCallback, useEffect, useRef, useState } from 'react';

// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { updateConnections, connectedNewSession, disconnected } from 'src/redux/slices/wcLegacy';

// walletconnect
import LegacySignClient from '@walletconnect/client';
import { IWalletConnectSession } from '@walletconnect/legacy-types';

// consts
import { EIP155_SIGNING_METHODS } from './wcConsts';

// components
import { useSnackbar } from 'src/components/snackbar';
import ModalStore from 'src/store/ModalStore';
import { getSdkError } from '@walletconnect/utils';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';

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

export default function useWalletConnectLegacy({ account, chainId, clearWcClipboard }: any) {
  /** HOOKS */
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { trackEvent } = useAnalyticsContext();

  // This is needed cause of the WalletConnect event handlers
  const stateRef: any = useRef();
  stateRef.current = { account, chainId };

  /** REDUX */
  const { connections } = useSelector((state) => state.wcLegacy);

  /** STATE */
  const [isConnecting, setIsConnecting] = useState(false);

  // Side effects that will run on every state change/rerender
  const maybeUpdateSessions = () => {
    // restore connectors and update the ones that are stale
    let _updateConnections = false;
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
          _updateConnections = true;
        }
      }
    });

    if (_updateConnections)
      dispatch(
        updateConnections({
          connections: connections
            .filter(({ connectionId }: any) => connectors[connectionId])
            .map(({ connectionId }: any) => ({
              connectionId,
              session: connectors[connectionId].session,
              isOffline: checkIsOffline(connectionId),
            })),
        })
      );
  };
  useEffect(maybeUpdateSessions, [account, chainId]);
  // we need this so we can invoke the latest version from any event handler
  stateRef.current.maybeUpdateSessions = maybeUpdateSessions;

  // New connections
  const connect = useCallback(
    async (connectorOpts: any) => {
      const connectionIdentifier = connectorOpts.uri;

      if (connectors[connectionIdentifier]) {
        enqueueSnackbar('dApp already connected', { variant: 'error' });
        return connectors[connectionIdentifier];
      }
      let connector: LegacySignClient | any;
      try {
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
        enqueueSnackbar(`Unable to connect to ${connectionIdentifier}: ${e.message}`, {
          variant: 'error',
        });
        return null;
      }

      const onError = (err: any) => {
        enqueueSnackbar(
          `WalletConnect error: ${
            connector.session && connector.session.peerMeta && connector.session.peerMeta.name
          } ${err.message || err}`,
          { variant: 'error' }
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
            enqueueSnackbar(`Unable to get session from dApp - ${suggestion}`, {
              variant: 'error',
            });
        }, SESSION_TIMEOUT);

      connector.on('session_request', (error: any, payload: any) => {
        if (error) {
          onError(error);
          return;
        }

        setIsConnecting(true);

        ModalStore.open('LegacySessionProposalModal', {
          legacyProposal: payload,
          onApprove: (selectedAccounts: any) => {
            if (payload) {
              connector.approveSession({
                accounts: selectedAccounts['eip155'],
                chainId: chainId ?? 1,
              });
            }

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

            trackEvent(AnalyticsEvents.APPROVED_CONNECT_DAPP, {});

            ModalStore.close();
          },
          onReject: () => {
            if (payload) {
              connector.rejectSession(getSdkError('USER_REJECTED_METHODS'));
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

            enqueueSnackbar('Successfully connected to ' + connector.session.peerMeta.name);

            trackEvent(AnalyticsEvents.REJECTED_CONNECT_DAPP, {});

            setIsConnecting(false);
            ModalStore.close();
          },
        });
      });

      connector.on('error', onError);

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

        onCallRequest(connector, payload);
      });

      connector.on('disconnect', async (error: any, payload: any) => {
        if (error) {
          onError(error);
          return;
        }

        deleteCachedLegacySession();

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
          enqueueSnackbar(
            'dApp disconnected immediately - perhaps it does not support the current network?',
            { variant: 'error' }
          );
        } else {
          enqueueSnackbar(
            `${connector.session?.peerMeta.name} disconnected: ${payload.params[0].message}`
          );
        }
      });

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
    connect,
    disconnect,
    isConnecting,
  };
}

const onCallRequest = async (
  connector: any,
  payload: { id: number; method: string; params: any[] }
) => {
  switch (payload.method) {
    case EIP155_SIGNING_METHODS.ETH_SIGN:
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
      return ModalStore.open('LegacySessionSignModal', {
        legacyCallRequestEvent: payload,
        legacyRequestSession: connector.session,
        chainId: connector.chainId,
        protocol: connector.protocol,
        connector: connector,
      });

    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      return ModalStore.open('LegacySessionSignTypedDataModal', {
        legacyCallRequestEvent: payload,
        legacyRequestSession: connector.session,
        connector: connector,
      });

    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      return ModalStore.open('LegacySessionSendTransactionModal', {
        legacyCallRequestEvent: payload,
        legacyRequestSession: connector.session,
        chainId: connector.chainId,
        protocol: connector.protocol,
        connector: connector,
      });

    default:
      alert(`${payload.method} is not supported for WalletConnect v1`);
      connector.rejectRequest({
        id: payload.id,
        error: { message: 'Method not found: ' + payload.method, code: -32601 },
      });
  }
};

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
