// routes
import { paths } from 'src/routes/paths';

// API
// ----------------------------------------------------------------------

export const HOST_API = process.env.NEXT_PUBLIC_HOST_API;
export const ASSETS_API = process.env.NEXT_PUBLIC_ASSETS_API;

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

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root; // as '/dashboard'
