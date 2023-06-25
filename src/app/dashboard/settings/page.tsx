// sections
import { NORMAL_WALLET_INFO } from 'src/config-global';
import { SettingsView } from 'src/sections/settings/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `${NORMAL_WALLET_INFO.name} | Settings`,
};

export default function SettingsPage() {
  return <SettingsView />;
}
