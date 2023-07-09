import { useEffect, useState } from 'react';
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
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  token: OwnedToken;
  toAddress: string;
  onClose: any;
};

export default function DepositAsset({ open, token, toAddress, onClose }: Props) {
  const { t } = useLocales();
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

  const handleOnClose = () => {
    onClose();
    setAmount('');
  };

  useEffect(() => {
    if (transferTokenSuccess) {
      enqueueSnackbar(`${symbol} deposit successfully sent!`, { variant: 'success' });
      handleOnClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferTokenSuccess]);

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
      return (
        <Alert severity="error">
          {t('home.onboarding.depositToken.modal.errors.contract.prefix') +
            symbol +
            t('home.onboarding.depositToken.modal.errors.contract.suffix')}{' '}
        </Alert>
      );

    if (transferTokenError)
      return (
        <Alert severity="error">
          {t('home.onboarding.depositToken.modal.errors.transfer.prefix') +
            symbol +
            t('home.onboarding.depositToken.modal.errors.transfer.suffix')}
        </Alert>
      );

    return (
      <>
        <TextField
          value={amount}
          onChange={handleAmount}
          placeholder={t('home.onboarding.depositToken.modal.form.placeholder') || ''}
          disabled={transferTokenLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" onClick={selectMax}>
                <Typography variant="body1" sx={{ color: 'text.disabled' }}>
                  {t('common.words.max').toUpperCase()}
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
          {t('common.actions.deposit') + symbol}
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
          {`${balance} ${symbol}`} {t('common.words.available')}
        </Typography>

        {renderContent()}
      </Stack>
    </Dialog>
  );
}
