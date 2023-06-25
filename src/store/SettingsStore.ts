import { EIP155_CHAINS } from 'src/hooks/walletConnect/wcConsts';
import { proxy } from 'valtio';

/**
 * Types
 */
interface State {
  relayerRegionURL: string;
  activeChainId: string;
}

/**
 * State
 */
const state = proxy<State>({
  activeChainId:
    process.env.NODE_ENV === 'production'
      ? EIP155_CHAINS['eip155:1'].chainId.toString()
      : EIP155_CHAINS['eip155:5'].chainId.toString(),
  relayerRegionURL: '',
});

/**
 * Store / Actions
 */
const SettingsStore = {
  state,

  setRelayerRegionURL(relayerRegionURL: string) {
    state.relayerRegionURL = relayerRegionURL;
  },

  setActiveChainId(value: string) {
    state.activeChainId = value;
  },
};

export default SettingsStore;
