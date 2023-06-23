import { useState } from 'react';
import { useContract, useTransferToken, Web3Button } from '@thirdweb-dev/react';

// @mui
import { Stack, Dialog, TextField, Typography, InputAdornment, Avatar } from '@mui/material';
import { OwnedToken } from 'alchemy-sdk';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  token: OwnedToken;
  toAddress: string;
  onClose: any;
};

export default function DepositAsset({ open, token, toAddress, onClose }: Props) {
  const { contractAddress, logo, name, symbol, balance } = token;

  const { contract } = useContract(contractAddress);
  const { mutate: transferTokens } = useTransferToken(contract);
  const { trackEvent } = useAnalyticsContext();

  const [amount, setAmount] = useState('');

  const handleAmount = (event: any) => {
    setAmount(event.target.value);
  };

  const selectMax = () => {
    setAmount(balance || '');
  };

  const handleOnClose = () => {
    onClose();
    setAmount('');
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={handleOnClose}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pt: 2.5, px: 2.5 }}
      >
        <Avatar src={logo} sx={{ width: 48, height: 48 }} />
        <Typography variant="h6"> {name} </Typography>
      </Stack>

      <Stack sx={{ p: 2.5 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {balance + ' ' + symbol} available
        </Typography>

        <TextField
          value={amount}
          onChange={handleAmount}
          placeholder="Enter amount"
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

        {/* TODO: button stuck in loading state for some reason */}
        <Web3Button
          contractAddress={contractAddress}
          isDisabled={amount === ''}
          action={() => {
            transferTokens({
              to: toAddress,
              amount,
            });
            trackEvent(AnalyticsEvents.DEPOSITED_TOKEN, { token: name, amount });
          }}
        >
          Deposit {symbol}
        </Web3Button>
      </Stack>
    </Dialog>
  );
}
