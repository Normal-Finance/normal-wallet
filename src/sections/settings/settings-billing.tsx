// @mui
import { Card, CardHeader, Box, Button, Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { APP_STUFF } from 'src/config-global';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';

// ----------------------------------------------------------------------

export default function SettingsBilling() {
  const { trackEvent } = useAnalyticsContext();

  return (
    <Grid container spacing={5} disableEqualOverflow sx={{ pb: 3 }}>
      <Grid xs={12} md={8}>
        {/* Payment methods */}
        <Card>
          <CardHeader
            title="Payment methods"
            subheader="Debit/credit cards used to pay gas expenses"
          />
          <Box sx={{ p: 3 }}>
            <Button
              variant="contained"
              color="info"
              href={APP_STUFF.billingLink}
              onClick={() => trackEvent(AnalyticsEvents.OPENED_BILLING)}
            >
              Manage payment methods
            </Button>
          </Box>
        </Card>
      </Grid>

      <Grid xs={12} md={4}>
        {/* Invoices */}
        <Card>
          <CardHeader title="Invoice History" subheader="Recent charges incurred by your account" />

          <Stack spacing={1.5} sx={{ px: 3, pt: 3, pb: 3 }}>
            <Button
              variant="contained"
              color="info"
              href={APP_STUFF.billingLink}
              onClick={() => trackEvent(AnalyticsEvents.OPENED_BILLING)}
            >
              View recent invoices
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}
