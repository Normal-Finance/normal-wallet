import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
// import { useToasts } from 'hooks/toasts'

// redux
import { useDispatch, useSelector } from 'src/redux/store';

// import { SignClient } from '@walletconnect/sign-client'
import SignClient from '@walletconnect/sign-client';
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';

import {
  UNISWAP_PERMIT_EXCEPTIONS,
  DEFAULT_EIP155_METHODS,
  DEFAULT_EIP155_EVENTS,
  WC2_SUPPORTED_METHODS,
} from './wcConsts';
// import networks from 'consts/networks'
import { ethers } from 'ethers';
import { WALLET_CONNECT } from 'src/config-global';
import {
  connectedNewSession,
  disconnected,
  requestAdded,
  requestsResolved,
} from 'src/redux/slices/wcV2';

const STORAGE_KEY = 'wc2_state';
const WC2_VERBOSE = process.env.REACT_APP_WC2_VERBOSE || 0;

export default function useWalletConnectV2({
  account,
  chainId,
  clearWcClipboard,
  setRequests,
}: any) {
  // This is needed cause of the WalletConnect event handlers
  const stateRef: any = useRef();
  stateRef.current = { account, chainId };

  const { connections, requests } = useSelector((state) => state.wcV2);
  const dispatch = useDispatch();

  const [initialized, setInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [client, setClient] = useState<any>(null);

  // const { console.log } = useToasts()

  const onInitialize = useCallback(async () => {
    try {
      SignClient.init({
        logger: 'debug',
        projectId: WALLET_CONNECT.projectId, // TODO
        relayUrl: 'wss://relay.walletconnect.com',
        metadata: {
          name: 'Normal Wallet',
          description: 'Normal Wallet, non custodial smart wallet',
          url: 'https://wallet.ambire.com/',
          icons: ['https://wallet.ambire.com/logo192.png'],
        },
      }).then((signClient: any) => {
        setClient(signClient);
        if (typeof signClient === 'undefined') {
          throw new Error('Client is not initialized');
        }
        if (WC2_VERBOSE) console.log('WC2 signClient initialized');
        setInitialized(true);
      });
    } catch (err) {
      setInitialized(false);
      alert(err);
      console.log(err);
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
        if (WC2_VERBOSE) console.log('WC2: Client not initialized');
        return;
      }

      const pairingTopicMatches = connectorOpts.uri.match(/wc:([a-f0-9]+)/);
      const pairingTopic = pairingTopicMatches[1];

      const existingPair = client?.pairing.values.find((p: any) => p.topic === pairingTopic);
      if (existingPair) {
        if (WC2_VERBOSE) console.log('WC2: Pairing already active');
        return;
      }

      setIsConnecting(true);
      try {
        let res = await client.pair({ uri: connectorOpts.uri });
        if (WC2_VERBOSE) console.log('pairing result', res);
      } catch (e) {
        console.log(e.message);
      }
    },
    [client, setIsConnecting]
  );

  const disconnect = useCallback(
    (connectionId: any) => {
      // connector might not be there, either cause we disconnected before,
      // or cause we failed to connect in the first place
      if (!client) {
        if (WC2_VERBOSE) console.log('WC2 disconnect: Client not initialized');

        dispatch(disconnected({ connectionId }));
        return;
      }

      const connection = connections.find((c: any) => c.connectionId === connectionId);

      if (connection) {
        const session = client.session.values.find(
          (a: any) => a.peer.publicKey === connection.proposerPublicKey
        );
        if (WC2_VERBOSE) console.log('WC2 disconnect (connection, session)', connection, session);

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
            console.log(err.message, { error: true });
          });
        } else {
          const response = formatJsonRpcError(id, resolution.message);
          client
            .respond({
              topic: topic,
              response,
            })
            .catch((err: any) => {
              console.log(err.message, { error: true });
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

      const supportedChains = ['eip155:1', 'eip155:5'];
      const usedChains: any = [];
      // networks.forEach(n => {
      //   if (!supportedChains.includes(n.chainId)) {
      //     supportedChains.push('eip155:' + n.chainId)
      //   }
      // })
      const unsupportedChains: any = [];
      requiredNamespaces.eip155?.chains.forEach((chainId: any) => {
        if (supportedChains.includes(chainId)) {
          usedChains.push(chainId);
        } else {
          unsupportedChains.push(chainId);
        }
      });
      if (unsupportedChains.length) {
        console.log(`Chains not supported ${unsupportedChains.join(',')}`, { error: true });
        if (WC2_VERBOSE) console.log('WC2 : Proposal rejected');
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
        if (WC2_VERBOSE) console.log('WC2 Approving client', namespaces);
        client
          .approve({
            id,
            relayProtocol: relays[0].protocol,
            namespaces,
          })
          .then((approveResult: any) => {
            if (WC2_VERBOSE) console.log('WC2 Approve result', approveResult);
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
            // dispatch({
            //   type: 'connectedNewSession',
            //   pairingTopic: params.pairingTopic,
            //   sessionTopic: approveResult.topic,
            //   proposerPublicKey: params.proposer.publicKey,
            //   session: { peerMeta: proposer.metadata },
            //   namespacedChainIds: usedChains,
            //   proposal
            // })
          })
          .catch((err: any) => {
            setIsConnecting(false);
            console.error('WC2 Error : ', err.message);
          });
      } else {
        setIsConnecting(false);
      }
    },
    [client, account, clearWcClipboard]
  );

  const onSessionRequest = useCallback(
    async (requestEvent: any) => {
      if (WC2_VERBOSE) console.log('session_request', requestEvent);
      const { id, topic, params } = requestEvent;
      const { request: wcRequest } = params;

      const namespacedChainId = (params.chainId || 'eip155:' + stateRef.current.chainId).split(':');

      const namespace = namespacedChainId[0];
      const chainId = namespacedChainId[1] * 1;

      if (namespace !== 'eip155') {
        const err = `Namespace "${namespace}" not compatible`;
        console.log(err, { error: true });
        await client
          .respond({
            topic: requestEvent.topic,
            response: formatJsonRpcError(requestEvent.id, err),
          })
          .catch((err: any) => {
            console.log(err.message, { error: true });
          });
        return;
      }

      if (WC2_SUPPORTED_METHODS.includes(wcRequest.method)) {
        let txn;
        let requestAccount;
        let method = wcRequest.method;
        if (WC2_VERBOSE) console.log('requestEvent.request.method', method);

        const connection = getConnectionFromSessionTopic(topic);
        if (connection) {
          const dappName = connection.session?.peerMeta?.name || '';
          if (method === 'personal_sign' || wcRequest.method === 'eth_sign') {
            txn = wcRequest.params[wcRequest.method === 'personal_sign' ? 0 : 1];
            requestAccount = wcRequest.params[wcRequest.method === 'personal_sign' ? 1 : 0];
          } else if (method === 'eth_sendTransaction') {
            requestAccount = wcRequest.params[0].from;
            txn = wcRequest.params[0];
          } else if (method === 'eth_signTypedData') {
            requestAccount = wcRequest.params[0];
            txn = JSON.parse(wcRequest.params[1]);

            if (txn.primaryType === 'MetaTransaction') {
              // either this, either declaring a method var, ONLY for this case
              method = 'eth_sendTransaction';
              txn = [
                {
                  to: txn.domain.verifyingContract,
                  from: txn.message.from,
                  data: txn.message.functionSignature,
                  value: txn.message.value || '0x0',
                },
              ];
            }
          } else if (method === 'eth_signTypedData_v4') {
            requestAccount = wcRequest.params[0];
            txn = JSON.parse(wcRequest.params[1]);

            // Dealing with Erc20 Permits
            if (txn.primaryType === 'Permit') {
              // If Uniswap, reject the permit and expect a graceful fallback (receiving approve eth_sendTransaction afterwards)
              if (
                UNISWAP_PERMIT_EXCEPTIONS.some((ex) =>
                  dappName.toLowerCase().includes(ex.toLowerCase())
                )
              ) {
                const response = formatJsonRpcError(id, {
                  message: 'Method not found: ' + method,
                  code: -32601,
                });
                client
                  .respond({
                    topic: topic,
                    response,
                  })
                  .catch((err: any) => {
                    console.log(err.message, { error: true });
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

          if (txn && ethers.utils.isAddress(requestAccount)) {
            const request = {
              id,
              type: method,
              dateAdded: new Date().valueOf(),
              connectionId: connection.pairingTopic,
              txn,
              chainId,
              topic,
              account: ethers.utils.getAddress(requestAccount),
              notification: true,
              dapp: connection.session?.peerMeta
                ? {
                    name: connection.session.peerMeta.name,
                    description: connection.session.peerMeta.description,
                    icons: connection.session.peerMeta.icons,
                    url: connection.session.peerMeta.url,
                  }
                : null,
            };
            setRequests((prev: any) => [...prev, request]);
            if (WC2_VERBOSE) console.log('WC2 request added :', request);
            dispatch(requestAdded({ request }));
            // dispatch({
            //   type: 'requestAdded', request
            // })
          }
        }
      } else {
        const err = `Method "${wcRequest.method}" not supported`;
        console.log(err, { error: true });
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
      // dispatch({
      //   type: 'disconnected',
      //   connectionId: connectionToDelete.connectionId
      // })
    },
    [client, dispatch, getConnectionFromSessionTopic]
  );

  ////////////////////////
  // SESSION HANDLERS STOP
  ////////////////////////////////////

  //rerun for every state change
  useEffect(() => {
    localStorage[STORAGE_KEY] = JSON.stringify({ connections, requests });

    if (client) {
      // updating active connections
      client.session.values.forEach((session: any) => {
        if (WC2_VERBOSE) console.log('WC2 updating session', session);
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
              if (WC2_VERBOSE) console.log('WC2 Updated ', updateResult);
            })
            .catch((err: any) => {
              console.log('WC2 Update Error: ' + err.message, session);
            });
        } else {
          if (WC2_VERBOSE)
            console.log('WC2 : session topic not found in connections ' + session.topic);
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
