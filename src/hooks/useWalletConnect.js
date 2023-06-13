import { useMemo, useEffect, useCallback } from 'react';
import useWalletConnectV2 from 'src/hooks/walletConnect/walletConnectV2';
import useWalletConnectLegacy from 'src/hooks/walletConnect/walletConnectLegacy';
import { isFirefox } from 'src/utils/isFirefox';

// components
import { useSnackbar } from 'src/components/snackbar';

export default function useWalletConnect({ account, chainId, useStorage, setRequests }) {
  /** HOOKS */
  const { enqueueSnackbar } = useSnackbar();

  const clipboardError = (e) =>
    enqueueSnackbar('non-fatal clipboard/walletconnect err: ' + e.message, { variant: 'error' });
  const getClipboardText = useCallback(async () => {
    if (isFirefox()) return false;

    try {
      return await navigator.clipboard.readText();
    } catch (e) {
      clipboardError(e);
    }

    return false;
  }, []);

  const clearWcClipboard = useCallback(async () => {
    const clipboardText = await getClipboardText();
    if (clipboardText && clipboardText.match(/wc:[a-f0-9-]+@[12]\?/)) {
      navigator.clipboard.writeText('');
    }
  }, [getClipboardText]);

  const {
    connections: connectionsLegacy,
    connect: connectLegacy,
    disconnect: disconnectLegacy,
    isConnecting: isConnectingLegacy,
    requests: requestsLegacy,
    resolveMany: resolveManyLegacy,
  } = useWalletConnectLegacy({
    account,
    clearWcClipboard,
    getClipboardText,
    chainId,
    useStorage,
    setRequests,
  });

  const {
    connections: connectionsV2,
    connect: connectV2,
    disconnect: disconnectV2,
    isConnecting: isConnectingV2,
    requests: requestsV2,
    resolveMany: resolveManyV2,
  } = useWalletConnectV2({
    account,
    clearWcClipboard,
    getClipboardText,
    chainId,
    setRequests,
  });

  const requests = useMemo(
    () => [
      ...requestsLegacy.map((r) => {
        return {
          ...r,
          wcVersion: 1,
        };
      }),
      ...requestsV2.map((r) => {
        return {
          ...r,
          wcVersion: 2,
        };
      }),
    ],
    [requestsLegacy, requestsV2]
  );

  const connections = useMemo(
    () => [
      ...connectionsLegacy.map((c) => {
        return {
          ...c,
          wcVersion: 1,
        };
      }),
      ...connectionsV2.map((c) => {
        return {
          ...c,
          wcVersion: 2,
        };
      }),
    ],
    [connectionsLegacy, connectionsV2]
  );

  const resolveMany = (ids, resolution) => {
    resolveManyLegacy(ids, resolution);
    resolveManyV2(ids, resolution);
  };

  const connect = useCallback(
    (connectorOpts) => {
      if (connectorOpts.uri.match(/^wc:([a-f0-9]+)@2/)) {
        connectV2(connectorOpts);
      } else if (connectorOpts.uri.match(/^wc:([a-f0-9-]+)@1/)) {
        connectLegacy(connectorOpts);
      } else {
        enqueueSnackbar('Invalid WalletConnect uri', { variant: 'error' });
      }
    },
    [connectV2, connectLegacy]
  );

  const disconnect = useCallback(
    (connectionId, wcVersion) => {
      if (wcVersion === 2) {
        disconnectV2(connectionId);
      } else if (wcVersion === 1) {
        disconnectLegacy(connectionId);
      }
    },
    [disconnectV2, disconnectLegacy]
  );

  // clipboard stuff
  useEffect(() => {
    // if (initialWcURI) {
    //   if (account) connect({ uri: initialWcURI })
    //   else console.log('WalletConnect dApp connection request detected, please create an account and you will be connected to the dApp.', { timeout: 15000 })
    // }

    if (typeof window === 'undefined' || !window.location.href.includes('/?uri=')) return;

    const uriRaw = window.location.href.split('/?uri=')[1];

    const wcUri = uriRaw.split('#')[0];

    if (!wcUri) return;
    if (!wcUri.includes('key=') && !wcUri.includes('symKey='))
      return enqueueSnackbar('Invalid WalletConnect uri', { variant: 'error' });

    if (wcUri) connect({ uri: wcUri });
  }, [account, connect]);

  useEffect(() => {
    // hax TODO: ask why? seems working without
    // window.wcConnect = uri => connect({ uri })

    // @TODO on focus and on user action
    const clipboardError = (e) =>
      enqueueSnackbar('non-fatal clipboard/walletconnect err:' + e.message, { variant: 'error' });
    const tryReadClipboard = async () => {
      if (!account) return;
      if (isFirefox()) return;
      if (document.visibilityState !== 'visible') return;

      try {
        const clipboard = await navigator.clipboard.readText();
        if (clipboard.match(/wc:[a-f0-9-]+@[12]\?/)) {
          connect({ uri: clipboard });
        }
      } catch (e) {
        clipboardError(e);
      }
    };

    tryReadClipboard();
    document.addEventListener('visibilitychange', tryReadClipboard);

    return () => {
      document.removeEventListener('visibilitychange', tryReadClipboard);
    };
  }, [connect, account]);

  return {
    connections: connections,
    isConnecting: isConnectingLegacy || isConnectingV2,
    requests: requests,
    resolveMany,
    connect,
    disconnect,
  };
}
