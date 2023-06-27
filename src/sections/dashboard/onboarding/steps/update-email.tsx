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

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
};

type Props = {};

export default function UpdateEmail({}: Props) {
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

  const onSubmit = useCallback(async (data: FormValuesProps) => {
    await updateEmail(data.email);
  }, []);

  return (
    <Grid xs={12} md={12}>
      <Card sx={{ mb: 2 }}>
        <CardHeader
          title="Step 2 | Add your email"
          subheader="The email used to access your billing and receive payment notifications"
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
              Update email
            </LoadingButton>
          </Stack>
        </FormProvider>
      </Card>
    </Grid>
  );
}
