// i18n
import 'src/locales/i18n';

// scroll bar
import 'simplebar-react/dist/simplebar.min.css';

// lightbox
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';

// ----------------------------------------------------------------------
// moralis
import Moralis from 'moralis';
// thirdweb
import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  magicLink,
  smartWallet,
} from '@thirdweb-dev/react';
// import { Goerli, Ethereum } from '@thirdweb-dev/chains';
// redux
import ReduxProvider from 'src/redux/redux-provider';
// locales
import { LocalizationProvider } from 'src/locales';
// theme
import ThemeProvider from 'src/theme';
import { primaryFont } from 'src/theme/typography';
// components
import ProgressBar from 'src/components/progress-bar';
import MotionLazy from 'src/components/animate/motion-lazy';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';
import { SettingsProvider, SettingsDrawer } from 'src/components/settings';
import { MORALIS_API_KEY, THIRDWEB, WALLET_CONNECT } from 'src/config-global';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Normal Wallet',
  description: 'An ERC-4337 smart wallet with 90%+ cheaper gas and extendable functionality ',
  keywords: '',
  themeColor: '#000000',
  manifest: '/manifest.json',
  icons: [
    {
      rel: 'icon',
      url: '/favicon/favicon.ico',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon/favicon-16x16.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon/favicon-32x32.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/favicon/apple-touch-icon.png',
    },
  ],
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  Moralis.start({
    apiKey: MORALIS_API_KEY,
  });

  return (
    <html lang="en" className={primaryFont.className}>
      <body>
        <ThirdwebProvider
          // activeChain={}
          autoConnect
          supportedWallets={[
            smartWallet({
              factoryAddress: THIRDWEB.factoryAddress,
              thirdwebApiKey: THIRDWEB.apiKey,
              gasless: false,
              personalWallets: [
                metamaskWallet(),
                coinbaseWallet(),
                walletConnect({ projectId: WALLET_CONNECT.projectId }),
                magicLink({ apiKey: WALLET_CONNECT.relayUrl, emailLogin: true, smsLogin: true }),
              ],
            }),
          ]}
        >
          <ReduxProvider>
            <LocalizationProvider>
              <SettingsProvider
                defaultSettings={{
                  themeMode: 'light', // 'light' | 'dark'
                  themeDirection: 'ltr', //  'rtl' | 'ltr'
                  themeContrast: 'default', // 'default' | 'bold'
                  themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
                  themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
                  themeStretch: false,
                }}
              >
                <ThemeProvider>
                  <MotionLazy>
                    <SnackbarProvider>
                      <SettingsDrawer />
                      <ProgressBar />
                      {children}
                    </SnackbarProvider>
                  </MotionLazy>
                </ThemeProvider>
              </SettingsProvider>
            </LocalizationProvider>
          </ReduxProvider>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
