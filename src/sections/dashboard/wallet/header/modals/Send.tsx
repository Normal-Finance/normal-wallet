import { useState } from 'react';

import { CodeBlock, codepen } from 'react-code-blocks';

// @mui
import { Box, Stack, Button, DialogActions, Dialog, Typography, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { OwnedToken } from 'alchemy-sdk';
import { fEtherscanAddress } from 'src/utils/format-string';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  ethereumBalance: number;
  tokenBalances: OwnedToken[];
  onClose: any;
};

export default function Send({ open, ethereumBalance, tokenBalances, onClose }: Props) {
  const [transactionHash, setTransactionHash] = useState('');

  const handleOnClose = () => {
    setTransactionHash('');
    onClose();
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
        <Alert severity="warning">
          Sending crypto is not a supported feature yet. Come back later for new updates.
        </Alert>
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
