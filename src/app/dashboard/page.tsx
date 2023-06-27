// sections
import { NORMAL_WALLET_INFO } from 'src/config-global';
import { DashboardView } from 'src/sections/dashboard/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `${NORMAL_WALLET_INFO.name} | Dashboard`,
};

export default function OverviewAppPage() {
  return <DashboardView />;
}
