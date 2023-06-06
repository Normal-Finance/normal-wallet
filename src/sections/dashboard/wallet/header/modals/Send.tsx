import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Box,
  Stack,
  Button,
  MenuItem,
  DialogActions,
  Avatar,
  Dialog,
  Typography,
  InputAdornment,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import FormProvider from 'src/components/hook-form';
import { RHFTextField, RHFSelect } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  nativeBalance: string;
  tokenBalances: any;
  onClose: any;
};

export default function Send({ open, nativeBalance, tokenBalances, onClose }: Props) {
  const EventSchema = Yup.object().shape({
    network: Yup.string().required('Network is required'),
    tokens: Yup.array().of(Yup.string()).required(),
    amounts: Yup.array().of(Yup.string()).required(),
    denominations: Yup.array().of(Yup.string()).required(),
    address: Yup.string().required(),
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: {
      network: 'Ethereum',
      tokens: [],
      amounts: [],
      denominations: [],
      address: '',
    },
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: any) => {
    // ...
  };

  const values = watch();

  const NETWORK_OPTIONS: any = [];

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pt: 2.5, px: 2.5 }}
        >
          <Typography variant="h6"> Send </Typography>
        </Stack>

        <Stack sx={{ p: 2.5 }}>
          {/* Network */}
          <RHFSelect
            name="provider"
            label="Provider"
            size="small"
            InputLabelProps={{ shrink: true }}
            SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
          >
            {NETWORK_OPTIONS.map((network: any, index: any) => (
              <MenuItem
                key={index}
                value={network.value}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 0.75,
                  typography: 'body2',
                  textTransform: 'capitalize',
                }}
              >
                {/* <Avatar
                src={`/assets/walletProviders/${WalletProviders[provider]
                  .toUpperCase()
                  .replace(/ /g, '_')
                  .replace('.', '_')}.png`}
                sx={{ width: 20, height: 20, mr: 1 }}
              /> */}
                {network.label}
              </MenuItem>
            ))}
          </RHFSelect>

          {/* Address */}
          <RHFTextField
            name="address"
            label="Address"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Iconify icon="eva:people-outline" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />

          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Send
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
