// routes
import { paths } from 'src/routes/paths';

// API
// ----------------------------------------------------------------------

export const HOST_API = process.env.NEXT_PUBLIC_HOST_API;
export const ASSETS_API = process.env.NEXT_PUBLIC_ASSETS_API;

export const NORMAL_BATCHER_ADDRESS = process.env.NEXT_PUBLIC_BATCHER_ADDRESS;

export const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY;

export const MAGIC_API_KEY = process.env.NEXT_PUBLIC_MAGIC_API_KEY;

export const WALLET_CONNECT = {
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  relayUrl: process.env.NEXT_PUBLIC_WALLET_CONNECT_RELAY_UR || '',
};

export const THIRDWEB = {
  factoryAddress: process.env.NEXT_PUBLIC_THIRDWEB_FACTORY_ADDRESS || '',
  apiKey: process.env.NEXT_PUBLIC_THIRDWEB_API_KEY || '',
};

export const INTERCOM = {
  appId: process.env.NEXT_PUBLIC_INTERCOM_APP_ID || '',
  privateKey: process.env.NEXT_PUBLIC_INTERCOM_PRIVATE_KEY || '',
};

export const APP_STUFF = {
  billingLink: process.env.NEXT_PUBLIC_NORMAL_WALLET_BILLING,
  paths: {
    documentation: 'https://docs.normalwallet.io',
    helpCenter: 'https://help.normalwallet.io',
    twitter: 'https://twitter.com/normalfi',
    discord: 'https://link.normalfinance.io/discord',
    github: 'https://github.com/Normal-Finance',
  },
};
