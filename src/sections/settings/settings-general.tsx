import * as Yup from 'yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
// redux
import { useSelector } from 'src/redux/store';
// hooks
// utils
// components
import FormProvider, { RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';
import { Typography } from '@mui/material';

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
};

export default function SettingsGeneral() {
  const { updateEmail } = useWebsocketContext();

  /** REDUX */
  const { billing } = useSelector((state) => state.state);

  const UpdateUserSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const defaultValues = {
    email: billing.email || '',
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = useCallback(async (data: FormValuesProps) => {
    await updateEmail(data.email);
  }, []);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'reßpeat(2, 1fr)',
              }}
            >
              <RHFTextField
                name="email"
                label="Email Address"
                helperText={
                  'The email used to access your billing and receive payment notifications'
                }
              />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
