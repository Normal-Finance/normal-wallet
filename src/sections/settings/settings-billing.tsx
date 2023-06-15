// @mui
import Grid from '@mui/material/Unstable_Grid2';

// types
import { IUserAccountBillingHistory } from 'src/types/user';
import { IPaymentCard } from 'src/types/payment';
import { IAddressItem } from 'src/types/address';
//
import AccountBillingPayment from './settings-billing-payment';
import AccountBillingHistory from './settings-billing-history';

// ----------------------------------------------------------------------

type Props = {
  invoices: IUserAccountBillingHistory[];
};

export default function SettingsBilling({ invoices }: Props) {
  return (
    <Grid container spacing={5} disableEqualOverflow>
      <Grid xs={12} md={8}>
        <AccountBillingPayment />
      </Grid>

      <Grid xs={12} md={4}>
        <AccountBillingHistory invoices={invoices} />
      </Grid>
    </Grid>
  );
}
