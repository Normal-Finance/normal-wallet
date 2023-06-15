// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
// components
import { APP_STUFF } from 'src/config-global';

// ----------------------------------------------------------------------

type Props = {};

export default function SettingsBillingHistory({}: Props) {
  return (
    <Card>
      <CardHeader title="Invoice History" />

      <Stack spacing={1.5} sx={{ px: 3, pt: 3, pb: 3 }}>
        <Button variant="contained" color="info" href={APP_STUFF.billingLink}>
          View recent invoices
        </Button>
      </Stack>
    </Card>
  );
}
