import { useCallback, useEffect, useRef, useState } from 'react';
import { useSnapshot } from 'valtio';
import { getSignerAndProvider } from '@thirdweb-dev/react';
import { Goerli, Ethereum } from '@thirdweb-dev/chains';

import SettingsStore from 'src/store/SettingsStore';
import { createSignClient, signClient } from 'src/utils/walletConnect/WalletConnectUtil';

export default function useInitialization() {
  const [initialized, setInitialized] = useState(false);
  const prevRelayerURLValue = useRef('');

  const { relayerRegionURL } = useSnapshot(SettingsStore.state);

  const onInitialize = useCallback(async () => {
    try {
      // const { eip155Addresses } = createOrRestoreEIP155Wallet()
      // SettingsStore.setEIP155Address(eip155Addresses[0])

      const signer = getSignerAndProvider(Ethereum);
      console.log(signer);

      await createSignClient(relayerRegionURL);
      setInitialized(true);
    } catch (err) {
      alert(err);
    }
  }, [relayerRegionURL]);

  // restart transport if relayer region changes
  const onRelayerRegionChange = useCallback(() => {
    try {
      signClient.core.relayer.restartTransport(relayerRegionURL);
      prevRelayerURLValue.current = relayerRegionURL;
    } catch (err) {
      alert(err);
    }
  }, [relayerRegionURL]);

  useEffect(() => {
    if (!initialized) {
      onInitialize();
    }
    if (prevRelayerURLValue.current !== relayerRegionURL) {
      onRelayerRegionChange();
    }
  }, [initialized, onInitialize, relayerRegionURL, onRelayerRegionChange]);

  return initialized;
}
