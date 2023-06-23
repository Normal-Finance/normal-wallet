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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form';
import { RHFTextField, RHFSelect } from 'src/components/hook-form';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';
import { useWalletContext } from 'src/contexts/WalletContext';
import { OwnedToken, TransactionRequest } from 'alchemy-sdk';
import { TransactionPriority } from 'src/types/transaction';
import TransactionTypes from '../../dapps/transaction-types';
import { fEtherscanAddress } from 'src/utils/format-string';
import { useAlchemyContext } from 'src/contexts/AlchemyContext';

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
  const { refresh } = useAlchemyContext();
  const { enqueueSnackbar } = useSnackbar();
  const { newTransaction } = useWebsocketContext();
  const { smartWallet, smartWalletAddress } = useWalletContext();

  const { transactions } = useSelector((state) => state.state);

  const [transaction, setTransaction] = useState<TransactionRequest | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<TransactionPriority>(
    TransactionPriority.GTC
  );
  const [transactionHash, setTransactionHash] = useState('');

  const onSelectTransactionType = (newValue: TransactionPriority) => {
    setSelectedPriority(newValue);
  };

  const handleOnClose = () => {
    setTransactionHash('');
    onClose();
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
          let wallet = await smartWallet.getSigner();
          let { hash } = await wallet.sendTransaction(transaction);
          enqueueSnackbar('Transaction sent successfully!', { variant: 'success' });

          setTransactionHash(hash);
          refresh();

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
          setTransactionHash('BATCH');
          enqueueSnackbar('Transaction queued for batching!', { variant: 'success' });

          break;

        default:
          throw 'Unsupported Transaction Priority';
      }
    } else enqueueSnackbar('No wallet or transaction', { variant: 'error' });
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

  const renderForm = (
    <>
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
          {/* Ethereum */}
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

          {/* Tokens */}
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
    </>
  );

  const renderHashConfirmation = (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pt: 2.5, px: 2.5 }}
      >
        <Typography variant="h6"> Hash Confirmation </Typography>
      </Stack>

      <Stack alignItems="center" sx={{ p: 2.5 }}>
        <CodeBlock
          showLineNumbers={false}
          text={JSON.stringify(transactionHash, null, 2)}
          theme={codepen}
          language="json"
        />

        <Typography variant="body2">
          Your transaction has been submitted! You can view its status in your History, but we
          recommend Etherscan for the most up to date information.
        </Typography>
      </Stack>

      <DialogActions>
        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={handleOnClose}>
          Close
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          color={'info'}
          href={fEtherscanAddress(transactionHash)}
        >
          View on Etherscan
        </LoadingButton>
      </DialogActions>
    </>
  );

  const renderBatchConfirmation = (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pt: 2.5, px: 2.5 }}
      >
        <Typography variant="h6"> Batch Confirmation </Typography>
      </Stack>

      <Stack alignItems="center" sx={{ p: 2.5 }}>
        <Typography variant="body2">
          Your transaction has been queud for batching! You can view its status, update the
          priority, and cancel it entirely from your Dashboard or History.
        </Typography>
      </Stack>

      <DialogActions>
        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={handleOnClose}>
          Close
        </Button>
      </DialogActions>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Dialog fullWidth maxWidth="xs" open={open} onClose={handleOnClose}>
        {!transactionHash && renderForm}
        {transactionHash && (
          <>{transactionHash === 'BATCH' ? renderBatchConfirmation : renderHashConfirmation}</>
        )}
      </Dialog>
    </FormProvider>
  );
}
