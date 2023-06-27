import { useCallback, useEffect, useState } from 'react';
import { useContract, useTransferToken, Web3Button } from '@thirdweb-dev/react';

// @mui
import {
  Stack,
  Dialog,
  TextField,
  Typography,
  InputAdornment,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { OwnedToken } from 'alchemy-sdk';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  token: OwnedToken;
  toAddress: string;
  onClose: any;
};

export default function DepositAsset({ open, token, toAddress, onClose }: Props) {
  const { contractAddress, logo, name, symbol, balance } = token;

  const { enqueueSnackbar } = useSnackbar();

  const {
    contract,
    isLoading: contractLoading,
    isError: contractError,
  } = useContract(contractAddress);
  const {
    mutate: transferTokens,
    isLoading: transferTokenLoading,
    isError: transferTokenError,
    isSuccess: transferTokenSuccess,
  } = useTransferToken(contract);

  const { trackEvent } = useAnalyticsContext();

  const [amount, setAmount] = useState('');

  const handleOnClose = useCallback(() => {
    onClose();
    setAmount('');
  }, [onClose]);

  useEffect(() => {
    if (transferTokenSuccess) {
      enqueueSnackbar(`${symbol} deposit successfully sent!`, { variant: 'success' });
      handleOnClose();
    }
  }, [transferTokenSuccess, enqueueSnackbar, handleOnClose, symbol]);

  const handleAmount = (event: any) => {
    setAmount(event.target.value);
  };

  const selectMax = () => {
    setAmount(balance || '');
  };

  const handleOnSubmit = () => {
    transferTokens({
      to: toAddress,
      amount,
    });
    trackEvent(AnalyticsEvents.DEPOSITED_TOKEN, { token: name, amount });
  };

  const renderContent = () => {
    if (contractLoading) return <CircularProgress />;

    if (contractError)
      return <Alert severity="error">Unable to load the {symbol} contract at this time.</Alert>;

    if (transferTokenError)
      return <Alert severity="error">There was an error submitting your {symbol} deposit.</Alert>;

    return (
      <>
        <TextField
          value={amount}
          onChange={handleAmount}
          placeholder="Enter amount"
          disabled={transferTokenLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" onClick={selectMax}>
                <Typography variant="body1" sx={{ color: 'text.disabled' }}>
                  MAX
                </Typography>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Web3Button
          contractAddress={contractAddress}
          isDisabled={amount === '' || amount > balance! || transferTokenLoading}
          action={handleOnSubmit}
        >
          Deposit {symbol}
        </Web3Button>
      </>
    );
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={handleOnClose}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pt: 2.5, px: 2.5 }}
      >
        <Avatar src={logo} alt={name} sx={{ width: 48, height: 48 }} />
        <Typography variant="h6"> {name} </Typography>
      </Stack>

      <Stack sx={{ p: 2.5 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {`${balance} ${symbol}`} available
        </Typography>

        {renderContent()}
      </Stack>
    </Dialog>
  );
}
