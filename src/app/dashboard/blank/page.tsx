// sections
import { NORMAL_WALLET_INFO } from 'src/config-global';
import BlankView from 'src/sections/blank/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `${NORMAL_WALLET_INFO.name} | Blank`,
};

export default function BlankPage() {
  return <BlankView />;
}
