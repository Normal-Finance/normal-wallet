import { useEffect, useState } from 'react';

import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { CodeBlock, codepen } from 'react-code-blocks';

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
  InputAdornment,
  IconButton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';
import { useWalletContext } from 'src/contexts/WalletContext';
import { OwnedToken, TransactionRequest } from 'alchemy-sdk';
import { TransactionPriority } from 'src/types/transaction';
// import TransactionTypes from '../../dapps/transaction-types';
import { fEtherscanAddress } from 'src/utils/format-string';
import { useAlchemyContext } from 'src/contexts/AlchemyContext';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';
import { useContract } from '@thirdweb-dev/react';

// ----------------------------------------------------------------------

type Props = {
  token: OwnedToken;
  onClose: any;
};

type FormValues = {
  token: number;
  amount: string;
  toAddress: string;
};

export default function SendForm({ token, onClose }: Props) {
  const { refresh } = useAlchemyContext();
  const { enqueueSnackbar } = useSnackbar();
  const { newTransaction } = useWebsocketContext();
  const { smartWallet, walletAddresses } = useWalletContext();
  const { trackEvent } = useAnalyticsContext();

  const { contract, isLoading } = useContract(token.contractAddress);

  //   const { transactions } = useSelector((state) => state.state);

  const [transaction, setTransaction] = useState<TransactionRequest | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<TransactionPriority>(
    TransactionPriority.TRADITIONAL
  );
  const [transactionHash, setTransactionHash] = useState('');

  const onSelectTransactionType = (newValue: TransactionPriority) => {
    setSelectedPriority(newValue);
  };

  const onSelectMax = () => {
    setValue('amount', token?.balance!.toString());
  };

  const handleOnClose = () => {
    reset();
    onClose();
  };

  const EventSchema = Yup.object().shape({
    amount: Yup.string().required('Amount is required'),
    toAddress: Yup.string().required('To address is required'),
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: {
      amount: '',
      toAddress: '',
    },
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValues) => {
    console.log(isLoading);
    if (smartWallet && transaction && contract) {
      switch (selectedPriority) {
        case TransactionPriority.TRADITIONAL:
          // V1
          // let wallet = await smartWallet.getSigner();

          // let feeData = await wallet.getFeeData();
          // let updatedTransaction = {
          //   ...transaction,
          //   gasPrice: feeData.gasPrice?._hex,
          //   gasLimit: "200000"
          // }
          // console.log(updatedTransaction)

          // let { hash } = await wallet.sendTransaction(updatedTransaction);\

          // V2
          //   console.log(contract);
          //   const val = parseEther(values.amount.toString())._hex;

          //   const tx = await contract?.erc20.transfer.prepare(values.toAddress, 1);

          //   const gasCost = await tx?.estimateGasCost(); // Estimate the gas cost
          //   const simulatedTx = await tx?.simulate(); // Simulate the transaction
          //   const signedTx = await tx?.sign(); // Sign the transaction for later use

          //   console.log({ tx, gasCost, simulatedTx, signedTx });

          // ...

          // const txReceipt = await tx.execute();

          // enqueueSnackbar('Transaction sent successfully!', { variant: 'success' });
          // trackEvent(AnalyticsEvents.SENT_CRYPTO, { hash });

          // setTransactionHash(hash);
          // refresh();

          break;

        case TransactionPriority.GTC:
        case TransactionPriority.INSTANT:
          const success = await newTransaction(
            walletAddresses.smart,
            transaction.to!,
            transaction.value!.toString(),
            transaction.data as string,
            selectedPriority
          );
          if (success) {
            setTransactionHash('BATCH');
            enqueueSnackbar('Transaction queued for batching!', { variant: 'success' });
          }

          break;

        default:
          throw 'Unsupported Transaction Priority';
      }
    } else enqueueSnackbar('No wallet or transaction', { variant: 'error' });
  };

  const values = watch();

  useEffect(() => {
    if (values.amount && values.toAddress && ethers.utils.isAddress(values.toAddress)) {
      const value = parseEther(values.amount.toString())._hex;

      const abi = ['function transfer(address to, uint256 amount)'];
      const iface = new ethers.utils.Interface(abi);
      const calldata = iface.encodeFunctionData('transfer', [values.toAddress, value]);

      const _transaction: TransactionRequest = {
        to: token.contractAddress,
        from: walletAddresses.smart,
        data: calldata,
        value,
      };
      setTransaction(_transaction);
    }
  }, [values]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack sx={{ p: 2.5 }}>
        {/* Amount */}
        <RHFTextField
          name="amount"
          label="Amount"
          placeholder="Enter amount"
          type="number"
          helperText={`${token.balance} available`}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="select max amount" onClick={onSelectMax} edge="end">
                  <Typography variant="subtitle2">MAX</Typography>
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* To Address */}
        <RHFTextField name="toAddress" label="Address" sx={{ mb: 2 }} />

        {/* Gas Estimate and Priority Selection */}
        {/* {values.amount && values.toAddress && ethers.utils.isAddress(values.toAddress) && (
          <TransactionTypes
            newTransactions={transactions.NEW}
            transaction={transaction}
            selected={selectedPriority}
            onSelect={onSelectTransactionType}
          />
        )} */}
      </Stack>

      <DialogActions>
        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={handleOnClose}>
          Cancel
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          disabled={!values.amount || !values.toAddress}
          loading={isSubmitting}
        >
          Send
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}
