import { useCallback, useEffect, useRef, useState } from 'react';

// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { connectedNewSession, disconnected } from 'src/redux/slices/wcV2';

// walletconnect
import SignClient from '@walletconnect/sign-client';
import { getSdkError } from '@walletconnect/utils';
import { formatJsonRpcError } from '@json-rpc-tools/utils';

// consts
import { NORMAL_WALLET_INFO, WALLET_CONNECT } from 'src/config-global';

// components
import { useSnackbar } from 'src/components/snackbar';

import ModalStore from 'src/store/ModalStore';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';
import {
  DEFAULT_EIP155_METHODS,
  DEFAULT_EIP155_EVENTS,
  WC2_SUPPORTED_METHODS,
  EIP155_SIGNING_METHODS,
  EIP155_CHAINS,
} from './wcConsts';

const WC2_VERBOSE = process.env.REACT_APP_WC2_VERBOSE || 0;

export default function useWalletConnectV2({ account, chainId, clearWcClipboard }: any) {
  /** HOOKS */
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { trackEvent } = useAnalyticsContext();

  // This is needed cause of the WalletConnect event handlers
  const stateRef: any = useRef();
  stateRef.current = { account, chainId };

  /** REDUX */
  const { connections } = useSelector((state) => state.wcV2);

  /** STATE */
  const [initialized, setInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [client, setClient] = useState<any>(null);

  const onInitialize = useCallback(async () => {
    try {
      SignClient.init({
        logger: process.env.NODE_ENV === 'production' ? 'silent' : 'debug',
        projectId: WALLET_CONNECT.projectId,
        relayUrl: 'wss://relay.walletconnect.com',
        metadata: {
          name: NORMAL_WALLET_INFO.name,
          description: NORMAL_WALLET_INFO.description,
          url: NORMAL_WALLET_INFO.url,
          icons: [NORMAL_WALLET_INFO.logo],
        },
      }).then((signClient: any) => {
        setClient(signClient);
        if (typeof signClient === 'undefined') {
          throw new Error('Client is not initialized');
        }
        if (WC2_VERBOSE) enqueueSnackbar('WC2 signClient initialized');
        setInitialized(true);
      });
    } catch (err) {
      setInitialized(false);
      alert(err);
      enqueueSnackbar(err);
    }
  }, [enqueueSnackbar]);

  const getConnectionFromSessionTopic = useCallback(
    (sessionTopic: any) => connections.find((c: any) => c.sessionTopics.includes(sessionTopic)),
    [connections]
  );

  const connect = useCallback(
    async (connectorOpts: any) => {
      if (!client) {
        if (WC2_VERBOSE) enqueueSnackbar('WC2: Client not initialized', { variant: 'error' });
        return;
      }

      const pairingTopicMatches = connectorOpts.uri.match(/wc:([a-f0-9]+)/);
      const pairingTopic = pairingTopicMatches[1];

      const existingPair = client?.pairing.values.find((p: any) => p.topic === pairingTopic);
      if (existingPair) {
        if (WC2_VERBOSE) enqueueSnackbar('WC2: Pairing already active', { variant: 'error' });
        return;
      }

      setIsConnecting(true);
      try {
        const res = await client.pair({ uri: connectorOpts.uri });
        if (WC2_VERBOSE) enqueueSnackbar('pairing result', res);
      } catch (e) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    },
    [client, setIsConnecting, enqueueSnackbar]
  );

  const disconnect = useCallback(
    (connectionId: any) => {
      // connector might not be there, either cause we disconnected before,
      // or cause we failed to connect in the first place
      if (!client) {
        if (WC2_VERBOSE)
          enqueueSnackbar('WC2 disconnect: Client not initialized', { variant: 'error' });

        dispatch(disconnected({ connectionId }));
        return;
      }

      const connection = connections.find((c: any) => c.connectionId === connectionId);

      if (connection) {
        const session = client.session.values.find(
          (a: any) => a.peer.publicKey === connection.proposerPublicKey
        );
        if (WC2_VERBOSE)
          enqueueSnackbar(`WC2 disconnect (${connection}, ${session})`, { variant: 'error' });

        if (session) {
          client.disconnect({ topic: session.topic });
        }
      }

      dispatch(disconnected({ connectionId }));
    },
    [client, connections, dispatch, enqueueSnackbar]
  );

  /// /////////////////////
  // SESSION HANDLERS START
  /// /////////////////////////////////

  const onSessionProposal = useCallback(
    // eslint-disable-next-line consistent-return
    async (proposal: any) => {
      // Get required proposal data
      const { id, params } = proposal;
      const { proposer, requiredNamespaces, relays } = params;

      const supportedChains: any = [];
      const usedChains: any = [];
      Object.keys(EIP155_CHAINS).forEach((n) => {
        if (!supportedChains.includes(n)) {
          supportedChains.push(n);
        }
      });
      const unsupportedChains: any = [];
      requiredNamespaces.eip155?.chains.forEach((_chainId: any) => {
        if (supportedChains.includes(_chainId)) {
          usedChains.push(_chainId);
        } else {
          unsupportedChains.push(_chainId);
        }
      });
      if (unsupportedChains.length) {
        enqueueSnackbar(`Chains not supported ${unsupportedChains.join(',')}`, {
          variant: 'error',
        });
        if (WC2_VERBOSE) enqueueSnackbar('WC2 : Proposal rejected');
        return client.reject({ proposal });
      }

      const namespaces = {
        eip155: {
          chains: supportedChains,
          accounts: usedChains.map((a: any) => `${a}:${account}`),
          methods: WC2_SUPPORTED_METHODS,
          events: DEFAULT_EIP155_EVENTS,
        },
      };

      const existingClientSession = client.session.values.find(
        (s: any) => s.peer.publicKey === params.proposer.publicKey
      );

      clearWcClipboard();
      if (!existingClientSession) {
        if (WC2_VERBOSE) enqueueSnackbar(`WC2 Approving client ${namespaces}`);

        ModalStore.open('SessionProposalModal', {
          proposal,
          onApprove: () => {
            client
              .approve({
                id,
                relayProtocol: relays[0].protocol,
                namespaces,
              })
              .then((approveResult: any) => {
                trackEvent(AnalyticsEvents.APPROVED_CONNECT_DAPP, {});

                if (WC2_VERBOSE) enqueueSnackbar(`WC2 Approve result ${approveResult}`);

                setIsConnecting(false);
                dispatch(
                  connectedNewSession({
                    pairingTopic: params.pairingTopic,
                    sessionTopic: approveResult.topic,
                    proposerPublicKey: params.proposer.publicKey,
                    session: { peerMeta: proposer.metadata },
                    namespacedChainIds: usedChains,
                    proposal,
                  })
                );

                ModalStore.close();
              })
              .catch((err: any) => {
                setIsConnecting(false);
                console.error('WC2 Error : ', err.message);
              });
          },
          onReject: async () => {
            await client.reject({
              id,
              reason: getSdkError('USER_REJECTED_METHODS'),
            });
            trackEvent(AnalyticsEvents.REJECTED_CONNECT_DAPP, {});
            ModalStore.close();
          },
        });
      } else {
        setIsConnecting(false);
      }
    },
    [client, account, clearWcClipboard, dispatch, enqueueSnackbar, trackEvent]
  );

  const onSessionRequest = useCallback(
    async (requestEvent: any) => {
      if (WC2_VERBOSE) enqueueSnackbar('session_request', requestEvent);
      const { topic, params } = requestEvent;
      const { request: wcRequest } = params;

      const namespacedChainId = (params.chainId || `eip155:${stateRef.current.chainId}`).split(':');

      const namespace = namespacedChainId[0];
      // const chainId = namespacedChainId[1] * 1;

      if (namespace !== 'eip155') {
        const err = `Namespace "${namespace}" not compatible`;
        enqueueSnackbar(err, { variant: 'error' });
        await client
          .respond({
            topic: requestEvent.topic,
            response: formatJsonRpcError(requestEvent.id, err),
          })
          .catch((error: any) => {
            enqueueSnackbar(error.message, { variant: 'error' });
          });
        return;
      }

      if (WC2_SUPPORTED_METHODS.includes(wcRequest.method)) {
        const { method } = wcRequest;
        if (WC2_VERBOSE) enqueueSnackbar('requestEvent.request.method', method);

        const connection = getConnectionFromSessionTopic(topic);
        if (connection) {
          const { request } = params;
          const requestSession = client.session.get(topic);

          switch (request.method) {
            case EIP155_SIGNING_METHODS.ETH_SIGN:
            case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
              ModalStore.open('SessionSignModal', {
                requestEvent,
                requestSession,
                client,
              });
              break;

            case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
            case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
            case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
              ModalStore.open('SessionSignTypedDataModal', {
                requestEvent,
                requestSession,
                client,
              });
              break;
            case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
            case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
              ModalStore.open('SessionSendTransactionModal', {
                requestEvent,
                requestSession,
                client,
              });
              break;

            default:
              trackEvent(AnalyticsEvents.RECEIVED_UNSUPPORTED_WC_METHOD, { requestEvent });

              ModalStore.open('SessionUnsuportedMethodModal', {
                requestEvent,
                requestSession,
              });
              break;
          }
        }
      } else {
        const err = `Method "${wcRequest.method}" not supported`;
        enqueueSnackbar(err, { variant: 'error' });
        await client.respond({
          topic,
          response: formatJsonRpcError(requestEvent.id, err),
        });
      }
    },
    [client, getConnectionFromSessionTopic, enqueueSnackbar, trackEvent]
  );

  const onSessionDelete = useCallback(
    (deletion: any) => {
      if (typeof client === 'undefined') {
        throw new Error('Client is not initialized');
      }
      const connectionToDelete = getConnectionFromSessionTopic(deletion.topic);
      const sessionToDelete = client.session.values.find((s: any) =>
        connectionToDelete.sessionTopics.includes(s.topic)
      );
      if (sessionToDelete) {
        client
          .disconnect({
            topic: sessionToDelete.topic,
          })
          .catch((err: any) => {
            console.error(`could not disconnect topic ${deletion.topic}`);
          });
      }
      dispatch(disconnected({ connectionId: connectionToDelete.connectionId }));
    },
    [client, dispatch, getConnectionFromSessionTopic]
  );

  /// /////////////////////
  // SESSION HANDLERS STOP
  /// /////////////////////////////////

  // rerun for every state change
  useEffect(() => {
    if (client) {
      // updating active connections
      client.session.values.forEach((session: any) => {
        if (WC2_VERBOSE) enqueueSnackbar('WC2 updating session', session);
        const connection = connections.find((c: any) => c.sessionTopics.includes(session.topic));
        if (connection) {
          const namespaces = {
            eip155: {
              // restricting chainIds to WC pairing chainIds, or WC will throw
              accounts: connection.namespacedChainIds?.map((cid: any) => `${cid}:${account}`) || [],
              methods: DEFAULT_EIP155_METHODS,
              events: DEFAULT_EIP155_EVENTS,
            },
          };
          client
            .update({
              topic: session.topic,
              namespaces,
            })
            .then((updateResult: any) => {
              if (WC2_VERBOSE) enqueueSnackbar('WC2 Updated ', updateResult);
            })
            .catch((err: any) => {
              if (WC2_VERBOSE) enqueueSnackbar(`WC2 Update Error: ${err.message}`, session);
            });
        } else if (WC2_VERBOSE)
          enqueueSnackbar(`WC2 : session topic not found in connections ${session.topic}`);
      });
    }
  }, [client, connections, account, chainId, enqueueSnackbar]);

  useEffect(() => {
    if (initialized) return;

    onInitialize();
  }, [onInitialize, initialized]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (initialized) {
      client.on('session_proposal', onSessionProposal);
      client.on('session_request', onSessionRequest);
      client.on('session_delete', onSessionDelete);

      return () => {
        client.removeListener('session_proposal', onSessionProposal);
        client.removeListener('session_request', onSessionRequest);
        client.removeListener('session_delete', onSessionDelete);
      };
    }
  }, [
    client,
    connect,
    initialized,
    onSessionProposal,
    onSessionRequest,
    onSessionDelete,
    dispatch,
    account,
  ]);

  return {
    connections,
    isConnecting,
    connect,
    disconnect,
  };
}
