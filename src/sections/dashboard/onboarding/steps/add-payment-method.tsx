// @mui
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import { APP_STUFF } from 'src/config-global';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function AddPaymentMethod() {
  const { t } = useLocales();
  const { trackEvent } = useAnalyticsContext();

  return (
    <Grid xs={12} md={12}>
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={t('home.onboarding.steps.addPaymentMethod.title')}
          subheader={t('home.onboarding.steps.addPaymentMethod.title')}
        />
        <Box sx={{ p: 3 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            color="info"
            href={APP_STUFF.billingLink}
            onClick={() => trackEvent(AnalyticsEvents.OPENED_BILLING)}
          >
            Manage payment methods
          </Button>
        </Box>
      </Card>
    </Grid>
  );
}
