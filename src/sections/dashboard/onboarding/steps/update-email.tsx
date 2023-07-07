import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import { Card, CardHeader, Stack, InputAdornment } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
// redux
import { useSelector } from 'src/redux/store';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
};

export default function UpdateEmail() {
  const { t } = useLocales();
  const { updateEmail } = useWebsocketContext();

  /** REDUX */
  const { billing } = useSelector((state) => state.state);

  const defaultValues = {
    email: billing.email,
  };

  const methods = useForm({
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = useCallback(
    async (data: FormValuesProps) => {
      await updateEmail(data.email);
    },
    [updateEmail]
  );

  return (
    <Grid xs={12} md={12}>
      <Card sx={{ mb: 2 }}>
        <CardHeader
          title={t('home.onboarding.steps.updateEmail.title')}
          subheader={t('home.onboarding.steps.updateEmail.subtitle')}
        />
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField
              name="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify width={24} icon="eva:email-outline" />
                  </InputAdornment>
                ),
              }}
            />

            <LoadingButton
              type="submit"
              variant="contained"
              color="info"
              loading={isSubmitting}
              sx={{ ml: 'auto' }}
            >
              {t('common.actions.updateEmail')}
            </LoadingButton>
          </Stack>
        </FormProvider>
      </Card>
    </Grid>
  );
}
