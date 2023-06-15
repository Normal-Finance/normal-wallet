// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
// components
import { APP_STUFF } from 'src/config-global';
import { CardHeader } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {};

export default function SettingsBillingPayment({}: Props) {
  return (
    <>
      <Card>
        <CardHeader title="Payment methods" />
        <Box sx={{ p: 3 }}>
          <Button variant="contained" color="info" href={APP_STUFF.billingLink}>
            Manage payment methods
          </Button>
        </Box>
      </Card>
    </>
  );
}
