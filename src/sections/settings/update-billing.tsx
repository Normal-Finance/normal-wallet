import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import { Card, CardHeader, Stack, InputAdornment } from '@mui/material';
// redux
import { useSelector } from 'src/redux/store';
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

export default function UpdateBilling({}: Props) {
  const { enqueueSnackbar } = useSnackbar();
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
      try {
        await updateEmail(data.email);
        // enqueueSnackbar('Email updated!');
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Error updating email', { variant: 'error' });
      }
    },
    [enqueueSnackbar]
  );

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title="Email"
        subheader="The email used to access your billing and receive payment notifications"
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3} sx={{ p: 3 }}>
          <RHFTextField
            name={'email'}
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
  );
}
