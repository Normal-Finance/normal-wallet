// sections
// import { HomeView } from 'src/sections/home/view';

import { redirect } from 'next/navigation';
import { NORMAL_WALLET_INFO } from 'src/config-global';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export const metadata = {
  title: `${NORMAL_WALLET_INFO.name} | Ethereum smart wallet with 90% gas savings`,
};

export default function HomePage() {
  return redirect(paths.root);
}
