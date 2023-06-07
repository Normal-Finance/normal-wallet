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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import FormProvider from 'src/components/hook-form';
import { RHFTextField, RHFSelect } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  nativeBalance: number;
  tokenBalances: any;
  onClose: any;
};

export default function Send({ open, nativeBalance, tokenBalances, onClose }: Props) {
  const hasETH = nativeBalance > 0;
  const canSend = hasETH || tokenBalances.length > 0;
  
  const EventSchema = Yup.object().shape({
    asset: Yup.string().required('Asset is required'),
    amount: Yup.array().of(Yup.string()).required('Amount is required'),
    toAddress: Yup.string().required('To address is required'),
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: {
      asset: 'Ethereum',
      amount: 0,
      toAddress: '',
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
          {!canSend && ()}

          {canSend && (<>
          {/* Asset */}
          <RHFSelect
            name="asset"
            label="Asset"
            size="small"
            InputLabelProps={{ shrink: true }}
            SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
          >
            {hasETH && (<MenuItem
                value={'ETH'}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 0.75,
                  typography: 'body2',
                  textTransform: 'capitalize',
                }}
              >
                ETH
              </MenuItem>)}
            {tokenBalances.map((tokenBalance: any, index: any) => {
              const { value, token } = tokenBalance.toJSON();
              
              return (
                <MenuItem
                  key={index}
                  value={token.value}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 0.75,
                    typography: 'body2',
                    textTransform: 'capitalize',
                  }}
                >
                  {token?.name} {value + ' ' + token?.symbol}
                </MenuItem>
              )
            } )}
          </RHFSelect>

            {/* Amount */}
          <RHFTextField
              name="amount"
              label="Amount"
              placeholder="Enter amount"
              type="number"
            />

          {/* To Address */}
          <RHFTextField
            name="toAddress"
            label="Address"
          />
          </>)}
          
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
