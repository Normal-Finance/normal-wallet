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
  activeChainId: '1',
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
