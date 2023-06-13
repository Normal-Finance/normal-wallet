import { useState } from 'react';
import { useContract, useTransferToken, Web3Button } from '@thirdweb-dev/react';

// @mui
import {
  Stack,
  Dialog,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Avatar,
} from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  token: any;
  toAddress: string;
  onClose: any;
};

export default function DepositAsset({ open, token, toAddress, onClose }: Props) {
  const { contract } = useContract(token.token_address);
  const { mutate: transferTokens, isLoading, error } = useTransferToken(contract);

  const [amount, setAmount] = useState('');

  const handleAmount = (event: any) => {
    setAmount(event.target.value);
  };

  const selectMax = () => {
    setAmount(token.balance);
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pt: 2.5, px: 2.5 }}
      >
        <Avatar src={token.logo} sx={{ width: 48, height: 48 }} />
        <Typography variant="h6"> {token.name} </Typography>
      </Stack>

      <Stack sx={{ p: 2.5 }}>
        <Typography variant="body1">
          {token.balance / token.decimals} {token.symbol}
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
        />
        <Web3Button
          contractAddress={token.token_address}
          action={() =>
            transferTokens({
              to: toAddress, // Address to transfer to
              amount, // Amount to transfer
            })
          }
        >
          Deposit
        </Web3Button>
      </Stack>
    </Dialog>
  );
}
