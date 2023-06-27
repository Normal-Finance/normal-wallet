// sections
import { NORMAL_WALLET_INFO } from 'src/config-global';
import { TransactionsView } from 'src/sections/transactions/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `${NORMAL_WALLET_INFO.name} | Transactions`,
};

export default function SettingsPage() {
  return <TransactionsView />;
}
