// @mui
import Grid from '@mui/material/Unstable_Grid2';

// types
import { IUserAccountBillingHistory } from 'src/types/user';
//
import AccountBillingPayment from './settings-billing-payment';
import AccountBillingHistory from './settings-billing-history';

// ----------------------------------------------------------------------

type Props = {};

export default function SettingsBilling({}: Props) {
  return (
    <Grid container spacing={5} disableEqualOverflow sx={{ pb: 3 }}>
      <Grid xs={12} md={8}>
        <AccountBillingPayment />
      </Grid>

      <Grid xs={12} md={4}>
        <AccountBillingHistory />
      </Grid>
    </Grid>
  );
}
