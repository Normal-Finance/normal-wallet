/**
 * Types
 */

type RelayerType = {
  value: string;
  label: string;
};

export type TEIP155Chain = keyof typeof EIP155_CHAINS;

/**
 * Relayer Regions
 */
export const REGIONALIZED_RELAYER_ENDPOINTS: RelayerType[] = [
  {
    value: 'wss://relay.walletconnect.com',
    label: 'Default',
  },

  {
    value: 'wss://us-east-1.relay.walletconnect.com',
    label: 'US',
  },
  {
    value: 'wss://eu-central-1.relay.walletconnect.com',
    label: 'EU',
  },
  {
    value: 'wss://ap-southeast-1.relay.walletconnect.com',
    label: 'Asia Pacific',
  },
];

/**
 * Chains
 */
export const EIP155_MAINNET_CHAINS = {
  'eip155:1': {
    chainId: 1,
    name: 'Ethereum',
    logo: '/chain-logos/eip155-1.png',
    rgb: '99, 125, 234',
    rpc: 'https://cloudflare-eth.com/',
  },
};

// export const EIP155_TEST_CHAINS = {
//   'eip155:5': {
//     chainId: 5,
//     name: 'Ethereum Goerli',
//     logo: '/chain-logos/eip155-1.png',
//     rgb: '99, 125, 234',
//     rpc: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
//   },
// };

export const EIP155_CHAINS = {
  ...EIP155_MAINNET_CHAINS,
  // ...EIP155_TEST_CHAINS,
};

/**
 * Methods
 */
export const EIP155_SIGNING_METHODS = {
  PERSONAL_SIGN: 'personal_sign',
  ETH_SIGN: 'eth_sign',
  ETH_SIGN_TRANSACTION: 'eth_signTransaction',
  ETH_SIGN_TYPED_DATA: 'eth_signTypedData',
  ETH_SIGN_TYPED_DATA_V3: 'eth_signTypedData_v3',
  ETH_SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4',
  ETH_SEND_RAW_TRANSACTION: 'eth_sendRawTransaction',
  ETH_SEND_TRANSACTION: 'eth_sendTransaction',
};

export const DEFAULT_EIP155_EVENTS = ['chainChanged', 'accountsChanged'];

export const WC2_SUPPORTED_METHODS = [
  'eth_sendTransaction',
  'personal_sign',
  'eth_signTypedData',
  'eth_sign',
  'eth_sendRawTransaction',
  'eth_signTransaction',
  'eth_signTypedData',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
];

export const WC1_SUPPORTED_METHODS = [
  'eth_sendTransaction',
  'gs_multi_send',
  'personal_sign',
  'eth_sign',
  'eth_signTypedData_v4',
  'eth_signTypedData',
  'wallet_switchEthereumChain',
  'ambire_sendBatchTransaction',
];

export const DEFAULT_EIP155_METHODS = [
  'eth_sendTransaction',
  'personal_sign',
  'eth_signTypedData',
  'eth_signTransaction',
  'eth_sign',
];
