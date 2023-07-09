// @mui
import { Card, CardHeader, Box, Button, Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { APP_STUFF } from 'src/config-global';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function SettingsBilling() {
  const { t } = useLocales();
  const { trackEvent } = useAnalyticsContext();

  return (
    <Grid container spacing={5} disableEqualOverflow sx={{ pb: 3 }}>
      <Grid xs={12} md={8}>
        {/* Payment methods */}
        <Card>
          <CardHeader
            title={t('settings.tabs.billing.paymentMethods.title')}
            subheader={t('settings.tabs.billing.paymentMethods.subtitle')}
          />
          <Box sx={{ p: 3 }}>
            <Button
              variant="contained"
              color="info"
              href={APP_STUFF.billingLink}
              onClick={() => trackEvent(AnalyticsEvents.OPENED_BILLING)}
            >
              {t('common.actions.managePaymentMethods')}
            </Button>
          </Box>
        </Card>
      </Grid>

      <Grid xs={12} md={4}>
        {/* Invoices */}
        <Card>
          <CardHeader
            title={t('settings.tabs.billing.invoiceHistory.title')}
            subheader={t('settings.tabs.billing.invoiceHistory.subtitle')}
          />

          <Stack spacing={1.5} sx={{ px: 3, pt: 3, pb: 3 }}>
            <Button
              variant="contained"
              color="info"
              href={APP_STUFF.billingLink}
              onClick={() => trackEvent(AnalyticsEvents.OPENED_BILLING)}
            >
              {t('common.actions.viewRecentInvoices')}
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}
