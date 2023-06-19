import { Grid, Typography } from '@mui/material';

import CheckoutSteps from './onboarding-steps';
import { useState } from 'react';
import DepositTokens from './steps/deposit-tokens';
import UpdateEmail from './steps/update-email';
import AddPaymentMethod from './steps/add-payment-method';
import OnboardingSteps from './onboarding-steps';

type Props = {
  _activeStep?: number;
};

export default function Onboarding({ _activeStep }: Props) {
  const ONBOARDING_STEPS = ['Deposit tokens', 'Update email', 'Add payment method'];

  const [activeStep, setActiveStep] = useState(_activeStep || 0);

  const onNextStep = () => {
    setActiveStep(activeStep + 1);
  };

  const onBackStep = () => {
    setActiveStep(activeStep - 1);
  };

  const onGotoStep = (step: number) => {
    setActiveStep(step);
  };

  return (
    <>
      <Typography variant="h4" sx={{ my: { xs: 3, md: 5 } }}>
        Getting started
      </Typography>

      <Grid container justifyContent={'center'}>
        <Grid xs={12} md={8}>
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
