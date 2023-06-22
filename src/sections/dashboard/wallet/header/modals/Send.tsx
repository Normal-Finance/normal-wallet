import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// ethers
import { ethers } from 'ethers';
import { parseEther } from 'ethers/lib/utils';

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
import { useWebsocketContext } from 'src/contexts/WebsocketContext';
import { useWalletContext } from 'src/contexts/WalletContext';
import { OwnedToken } from 'alchemy-sdk';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  ethereumBalance: number;
  tokenBalances: OwnedToken[];
  onClose: any;
};

type FormValues = {
  token: number;
  amount: string;
  toAddress: string;
};

export default function Send({ open, ethereumBalance, tokenBalances, onClose }: Props) {
  const { newTransaction } = useWebsocketContext();
  const { smartWalletAddress } = useWalletContext();

  const EventSchema = Yup.object().shape({
    token: Yup.number().required('Token is required'),
    amount: Yup.string().required('Amount is required'),
    toAddress: Yup.string().required('To address is required'),
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: {
      token: 0,
      amount: '',
      toAddress: '',
    },
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValues) => {
    let tokenContractAddress;
    if (data.token === -1) tokenContractAddress = '0x2170Ed0880ac9A755fd29B2688956BD959F933F8';
    else if (data.token > 0) tokenContractAddress = tokenBalances[data.token].contractAddress;

    const parsedValue = parseEther(data.amount);

    const ABI = ['function transfer(address to, uint256 amount)'];
    const iface = new ethers.utils.Interface(ABI);
    const calldata = iface.encodeFunctionData('transfer', [data.toAddress, parsedValue]);

    console.log({ smartWalletAddress, tokenContractAddress, parsedValue, calldata });
    // newTransaction(smartWalletAddress, tokenContractAddress, parsedValue.toString(), calldata);
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
          {/* Token */}
          <RHFSelect
            name="token"
            label="Token"
            size="small"
            InputLabelProps={{ shrink: true }}
            SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
          >
            {ethereumBalance > 0 && (
              <MenuItem
                value={-1}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 0.75,
                  typography: 'body2',
                  textTransform: 'capitalize',
                }}
              >
                ETH
              </MenuItem>
            )}
            {tokenBalances.map((token: OwnedToken, index: any) => {
              return (
                <MenuItem
                  key={index}
                  value={index}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 0.75,
                    typography: 'body2',
                    textTransform: 'capitalize',
                  }}
                >
                  {token.name} {token.balance + ' ' + token.symbol}
                </MenuItem>
              );
            })}
          </RHFSelect>

          {/* Amount */}
          <RHFTextField name="amount" label="Amount" placeholder="Enter amount" type="number" />

          {/* To Address */}
          <RHFTextField name="toAddress" label="Address" />
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
