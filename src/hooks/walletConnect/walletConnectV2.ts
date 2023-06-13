import { useCallback, useEffect, useRef, useState } from 'react';

// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { connectedNewSession, disconnected, requestsResolved } from 'src/redux/slices/wcV2';

// walletconnect
import SignClient from '@walletconnect/sign-client';
import { getSdkError } from '@walletconnect/utils';
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';

// consts
import {
  DEFAULT_EIP155_METHODS,
  DEFAULT_EIP155_EVENTS,
  WC2_SUPPORTED_METHODS,
  EIP155_SIGNING_METHODS,
  EIP155_CHAINS,
} from './wcConsts';
import { WALLET_CONNECT } from 'src/config-global';

// components
import { useSnackbar } from 'src/components/snackbar';

import ModalStore from 'src/store/ModalStore';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from 'src/utils/walletConnect/EIP155RequestHandlerUtil';

const WC2_VERBOSE = process.env.REACT_APP_WC2_VERBOSE || 0;

export default function useWalletConnectV2({
  account,
  chainId,
  clearWcClipboard,
  setRequests,
}: any) {
  /** HOOKS */
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  // This is needed cause of the WalletConnect event handlers
  const stateRef: any = useRef();
  stateRef.current = { account, chainId };

  /** REDUX */
  const { connections, requests } = useSelector((state) => state.wcV2);

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
          name: 'Normal Wallet',
          description: 'Normal Wallet, An Ethereum smart wallet',
          url: 'https://normalwallet.io/',
          icons: ['https://wallet.ambire.com/logo192.png'],
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
  }, []);

  const getConnectionFromSessionTopic = useCallback(
    (sessionTopic: any) => {
      return connections.find((c: any) => c.sessionTopics.includes(sessionTopic));
    },
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
        let res = await client.pair({ uri: connectorOpts.uri });
        if (WC2_VERBOSE) enqueueSnackbar('pairing result', res);
      } catch (e) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    },
    [client, setIsConnecting]
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

      dispatch(disconnected({ connectionId: connectionId }));
    },
    [client, connections]
  );

  const resolveMany = (ids: any, resolution: any) => {
    requests.forEach(({ id, topic }: any) => {
      if (ids.includes(id)) {
        if (resolution.success) {
          const response = formatJsonRpcResult(id, resolution.result);
          const respObj = {
            topic: topic,
            response,
          };
          client.respond(respObj).catch((err: any) => {
            enqueueSnackbar(err.message, { variant: 'error' });
          });
        } else {
          const response = formatJsonRpcError(id, resolution.message);
          client
            .respond({
              topic: topic,
              response,
            })
            .catch((err: any) => {
              enqueueSnackbar(err.message, { variant: 'error' });
            });
        }
      }
    });
    dispatch(requestsResolved({ ids: ids }));
  };

  ////////////////////////
  // SESSION HANDLERS START
  ////////////////////////////////////

  const onSessionProposal = useCallback(
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
      requiredNamespaces.eip155?.chains.forEach((chainId: any) => {
        if (supportedChains.includes(chainId)) {
          usedChains.push(chainId);
        } else {
          unsupportedChains.push(chainId);
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
          accounts: usedChains.map((a: any) => a + ':' + account),
          methods: WC2_SUPPORTED_METHODS,
          events: DEFAULT_EIP155_EVENTS,
        },
      };

      const existingClientSession = client.session.values.find(
        (s: any) => s.peer.publicKey === params.proposer.publicKey
      );

      clearWcClipboard();
      if (!existingClientSession) {
        if (WC2_VERBOSE) enqueueSnackbar('WC2 Approving client ' + namespaces);

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
                if (WC2_VERBOSE) enqueueSnackbar('WC2 Approve result ' + approveResult);
                setIsConnecting(false);
                dispatch(
                  connectedNewSession({
                    pairingTopic: params.pairingTopic,
                    sessionTopic: approveResult.topic,
                    proposerPublicKey: params.proposer.publicKey,
                    session: { peerMeta: proposer.metadata },
                    namespacedChainIds: usedChains,
                    proposal: proposal,
                  })
                );
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
          },
        });
      } else {
        setIsConnecting(false);
      }
    },
    [client, account, clearWcClipboard]
  );

  const onSessionRequest = useCallback(
    async (requestEvent: any) => {
      if (WC2_VERBOSE) enqueueSnackbar('session_request', requestEvent);
      const { id, topic, params } = requestEvent;
      const { request: wcRequest } = params;

      const namespacedChainId = (params.chainId || 'eip155:' + stateRef.current.chainId).split(':');

      const namespace = namespacedChainId[0];
      const chainId = namespacedChainId[1] * 1;

      if (namespace !== 'eip155') {
        const err = `Namespace "${namespace}" not compatible`;
        enqueueSnackbar(err, { variant: 'error' });
        await client
          .respond({
            topic: requestEvent.topic,
            response: formatJsonRpcError(requestEvent.id, err),
          })
          .catch((err: any) => {
            enqueueSnackbar(err.message, { variant: 'error' });
          });
        return;
      }

      if (WC2_SUPPORTED_METHODS.includes(wcRequest.method)) {
        let method = wcRequest.method;
        if (WC2_VERBOSE) enqueueSnackbar('requestEvent.request.method', method);

        const connection = getConnectionFromSessionTopic(topic);
        if (connection) {
          const { topic, params } = requestEvent;
          const { request } = params;
          const requestSession = client.session.get(topic);

          switch (request.method) {
            case EIP155_SIGNING_METHODS.ETH_SIGN:
            case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
              return ModalStore.open('SessionSignModal', {
                requestEvent,
                requestSession,
                onApprove: async () => {
                  if (requestEvent) {
                    const response = await approveEIP155Request(requestEvent);
                    await client.respond({
                      topic,
                      response,
                    });
                    ModalStore.close();
                  }
                },
                onReject: async () => {
                  if (requestEvent) {
                    const response = rejectEIP155Request(requestEvent);
                    await client.respond({
                      topic,
                      response,
                    });
                    ModalStore.close();
                  }
                },
              });

            case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
            case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
            case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
              return ModalStore.open('SessionSignTypedDataModal', {
                requestEvent,
                requestSession,
                onApprove: async () => {
                  const response = await approveEIP155Request(requestEvent);
                  await client.respond({
                    topic,
                    response,
                  });
                  ModalStore.close();
                },
                onReject: async () => {
                  const response = rejectEIP155Request(requestEvent);
                  await client.respond({
                    topic,
                    response,
                  });
                  ModalStore.close();
                },
              });

            case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
            case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
              return ModalStore.open('SessionSendTransactionModal', {
                requestEvent,
                requestSession,
                onApprove: async (setLoading: any) => {
                  if (requestEvent) {
                    // setLoading();
                    const response = await approveEIP155Request(requestEvent);
                    await client.respond({
                      topic,
                      response,
                    });
                    ModalStore.close();
                  }
                },
                onReject: async () => {
                  if (requestEvent) {
                    const response = rejectEIP155Request(requestEvent);
                    await client.respond({
                      topic,
                      response,
                    });
                    ModalStore.close();
                  }
                },
              });

            default:
              return ModalStore.open('SessionUnsuportedMethodModal', {
                requestEvent,
                requestSession,
              });
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
    [client, getConnectionFromSessionTopic, setRequests]
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
            console.error('could not disconnect topic ' + deletion.topic);
          });
      }
      dispatch(disconnected({ connectionId: connectionToDelete.connectionId }));
    },
    [client, dispatch, getConnectionFromSessionTopic]
  );

  ////////////////////////
  // SESSION HANDLERS STOP
  ////////////////////////////////////

  //rerun for every state change
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
              enqueueSnackbar('WC2 Update Error: ' + err.message, session);
            });
        } else {
          if (WC2_VERBOSE)
            enqueueSnackbar('WC2 : session topic not found in connections ' + session.topic);
        }
      });
    }
  }, [client, connections, requests, account, chainId]);

  useEffect(() => {
    if (initialized) return;

    onInitialize();
  }, [onInitialize, initialized]);

  useEffect(() => {
    if (initialized) {
      client.on('session_proposal', onSessionProposal);
      client.on('session_request', onSessionRequest);
      client.on('session_delete', onSessionDelete);

      client.on('session_ping', (data: any) => console.log('ping', data));
      client.on('session_event', (data: any) => console.log('event', data));
      client.on('session_update', (data: any) => console.log('update', data));

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
    connections: connections,
    requests: requests,
    isConnecting,
    resolveMany,
    connect,
    disconnect,
  };
}
