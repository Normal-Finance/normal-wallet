import { Grid, Typography } from '@mui/material';
import { useLocales } from 'src/locales';

import DepositTokens from './steps/deposit-tokens';
import UpdateEmail from './steps/update-email';
import AddPaymentMethod from './steps/add-payment-method';
import OnboardingSteps from './onboarding-steps';

type Props = {
  activeStep: number;
};

export default function Onboarding({ activeStep }: Props) {
  const { t } = useLocales();
  const ONBOARDING_STEPS = [
    t('home.onboarding.steps.depositToken.step'),
    t('home.onboarding.steps.updateEmail.step'),
    t('home.onboarding.steps.addPaymentMethod.step'),
  ];

  return (
    <>
      <Typography variant="h4" sx={{ my: { xs: 3, md: 5 } }}>
        {t('home.onboarding.title')}
      </Typography>

      <Grid container justifyContent="center">
        <Grid item xs={12} md={8}>
          <OnboardingSteps activeStep={activeStep} steps={ONBOARDING_STEPS} />
        </Grid>
      </Grid>

      <Grid container>
        {activeStep === 0 && <DepositTokens />}

        {activeStep === 1 && <UpdateEmail />}

        {activeStep === 2 && <AddPaymentMethod />}
      </Grid>
    </>
  );
}
