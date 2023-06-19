// @mui
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import { APP_STUFF } from 'src/config-global';

// ----------------------------------------------------------------------

type Props = {};

export default function AddPaymentMethod({}: Props) {
  return (
    <Grid xs={12} md={12}>
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Step 3 | Add a payment method"
          subheader="This is required to batch your transactions. You will only be charged for your share of the gas used to submit a batch."
        />
        <Box sx={{ p: 3 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            color="info"
            href={APP_STUFF.billingLink}
          >
            Manage payment methods
          </Button>
        </Box>
      </Card>
    </Grid>
  );
}
