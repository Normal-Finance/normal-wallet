import { useState } from 'react';

import { CodeBlock, codepen } from 'react-code-blocks';

// @mui
import {
  Box,
  Stack,
  Button,
  MenuItem,
  DialogActions,
  Dialog,
  Typography,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { OwnedToken } from 'alchemy-sdk';
import { fEtherscanAddress } from 'src/utils/format-string';
import SendForm from '../SendForm';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  ethereumBalance: number;
  tokenBalances: OwnedToken[];
  onClose: any;
};

export default function Send({ open, ethereumBalance, tokenBalances, onClose }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(-2);
  const [transactionHash, setTransactionHash] = useState('');

  const handleOnClose = () => {
    setTransactionHash('');
    onClose();
  };

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedIndex(event.target.value as any);
  };

  const ethToken: OwnedToken = {
    contractAddress: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    rawBalance: '', // TODO: ?
    decimals: 1,
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
    name: 'Ethereum',
    symbol: 'ETH',
    balance: ethereumBalance.toString(),
  };

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
        <Select
          name="token"
          label="Token"
          size="small"
          value={selectedIndex as any}
          onChange={handleChange}
          // InputLabelProps={{ shrink: true }}
          // SelectProps={{ native: false, sx: { textTransform: 'capitalize', mb: 2 } }}
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
              ETH - Ethereum
            </MenuItem>
          )}

          {/* Tokens */}
          {tokenBalances.map((token: OwnedToken, index: any) => (
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
              {token.name}
            </MenuItem>
          ))}
        </Select>

        {selectedIndex !== -2 && (
          <SendForm
            token={selectedIndex === -1 ? ethToken : tokenBalances[selectedIndex]}
            onClose={handleOnClose}
          />
        )}
      </Stack>
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
          color="info"
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
    <Dialog fullWidth maxWidth="xs" open={open} onClose={handleOnClose}>
      {!transactionHash && renderForm}
      {transactionHash && (
        <>{transactionHash === 'BATCH' ? renderBatchConfirmation : renderHashConfirmation}</>
      )}
    </Dialog>
  );
}
