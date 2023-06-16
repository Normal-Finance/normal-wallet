import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import { Card, CardHeader, Box, Button, Stack, InputAdornment } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { APP_STUFF } from 'src/config-global';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
};

type Props = {};

export default function SettingsBilling({}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { updateEmail } = useWebsocketContext();

  const defaultValues = {
    email: '',
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
      try {
        await updateEmail(data.email);
        enqueueSnackbar('Email updated!');
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Error updating email', { variant: 'error' });
      }
    },
    [enqueueSnackbar]
  );

  return (
    <Grid container spacing={5} disableEqualOverflow sx={{ pb: 3 }}>
      <Grid xs={12} md={8}>
        {/* Email */}
        <Card sx={{ mb: 2 }}>
          <CardHeader
            title="Email"
            subheader="The email used to access your billing and receive payment notifications"
          />
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3} sx={{ p: 3 }}>
              <RHFTextField
                name={'Email'}
                placeholder="youremail@gmail.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify width={24} icon={'eva:email-outline'} />
                    </InputAdornment>
                  ),
                }}
              />

              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                sx={{ ml: 'auto' }}
              >
                Save Changes
              </LoadingButton>
            </Stack>
          </FormProvider>
        </Card>

        {/* Payment methods */}
        <Card>
          <CardHeader
            title="Payment methods"
            subheader="Debit/credit cards used to pay gas expenses"
          />
          <Box sx={{ p: 3 }}>
            <Button variant="contained" color="info" href={APP_STUFF.billingLink}>
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
            <Button variant="contained" color="info" href={APP_STUFF.billingLink}>
              View recent invoices
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}
