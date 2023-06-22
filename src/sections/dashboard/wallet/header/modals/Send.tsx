import { useEffect, useState } from 'react';

import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// ethers
import { ethers } from 'ethers';
import { parseEther } from 'ethers/lib/utils';

// redux
import { useSelector } from 'src/redux/store';

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
import { OwnedToken, TransactionRequest } from 'alchemy-sdk';
import { TransactionPriority } from 'src/types/transaction';
import TransactionTypes from '../../dapps/transaction-types';

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
  const { smartWallet, smartWalletAddress } = useWalletContext();

  const { transactions } = useSelector((state) => state.state);

  const [transaction, setTransaction] = useState<TransactionRequest | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<TransactionPriority>(
    TransactionPriority.GTC
  );

  const onSelectTransactionType = (newValue: TransactionPriority) => {
    setSelectedPriority(newValue);
  };

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
    if (smartWallet && transaction) {
      switch (selectedPriority) {
        case TransactionPriority.TRADITIONAL:
          const sentTransaction = (await smartWallet.getSigner()).sendTransaction(transaction);
          // TODO: push to userTransactions state?

          break;

        case TransactionPriority.GTC:
        case TransactionPriority.INSTANT:
          newTransaction(
            smartWalletAddress,
            transaction.to!,
            transaction.value!.toString(),
            transaction.data as string,
            selectedPriority
          );

          break;

        default:
          throw 'Unsupported Transaction Priority';
      }
    } else {
      // TODO: enqueue
    }
  };

  const values = watch();

  useEffect(() => {
    if (values.amount && values.toAddress) {
      const tokenContractAddress =
        values.token === -1
          ? '0x2170Ed0880ac9A755fd29B2688956BD959F933F8'
          : tokenBalances[values.token].contractAddress;

      const value = parseEther(values.amount);

      const abi = ['function transfer(address to, uint256 amount)'];
      const iface = new ethers.utils.Interface(abi);
      const calldata = iface.encodeFunctionData('transfer', [values.toAddress, value]);

      let _transaction: TransactionRequest = {
        to: tokenContractAddress,
        from: smartWalletAddress,
        data: calldata,
        value,
      };
      setTransaction(_transaction);
    }
  }, [values]);

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

          {/* Gas Estimate and Priority Selection */}
          <TransactionTypes
            newTransactions={transactions.NEW}
            transaction={transaction}
            selected={selectedPriority}
            onSelect={onSelectTransactionType}
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
