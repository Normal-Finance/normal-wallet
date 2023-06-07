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
// components

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  asset: any;
  smartWalletAddress: string;
  onClose: any;
};

export default function DepositAsset({ open, asset, smartWalletAddress, onClose }: Props) {
  const { contract } = useContract(asset.token_address);
  const { mutate: transferTokens, isLoading, error } = useTransferToken(contract);

  const [amount, setAmount] = useState('');

  const handleAmount = (event: any) => {
    setAmount(event.target.value);
  };

  const selectMax = () => {
    setAmount(asset.balance);
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pt: 2.5, px: 2.5 }}
      >
        <Avatar src={asset.logo} sx={{ width: 48, height: 48 }} />
        <Typography variant="h6"> {asset.name} </Typography>
      </Stack>

      <Stack sx={{ p: 2.5 }}>
        <Typography variant="body1">
          {asset.balance / asset.decimals} {asset.symbol}
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
          contractAddress={asset.token_address}
          action={() =>
            transferTokens({
              to: smartWalletAddress, // Address to transfer to
              amount, // Amount to transfer
            })
          }
        >
          Transfer
        </Web3Button>

        {/* <Button variant="contained" size="large" disabled={amount === ''} onClick={handleSubmit}>
          Deposit
        </Button> */}
      </Stack>
    </Dialog>
  );
}
