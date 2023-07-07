import { useState } from 'react';

import { CodeBlock, codepen } from 'react-code-blocks';

// @mui
import { Box, Stack, Button, DialogActions, Dialog, Typography, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { OwnedToken } from 'alchemy-sdk';
import { fEtherscanAddress } from 'src/utils/format-string';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  ethereumBalance: number;
  tokenBalances: OwnedToken[];
  onClose: any;
};

export default function Send({ open, ethereumBalance, tokenBalances, onClose }: Props) {
  const { t } = useLocales();
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
        <Typography variant="h6"> {t('common.words.send')} </Typography>
      </Stack>

      <Stack sx={{ p: 2.5 }}>
        <Alert severity="warning">{t('home.wallet.header.modals.send.error')}</Alert>
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
        <Typography variant="h6">
          {' '}
          {t('home.wallet.header.modals.send.hashConfirmation.title')}{' '}
        </Typography>
      </Stack>

      <Stack alignItems="center" sx={{ p: 2.5 }}>
        <CodeBlock
          showLineNumbers={false}
          text={JSON.stringify(transactionHash, null, 2)}
          theme={codepen}
          language="json"
        />

        <Typography variant="body2">
          {t('home.wallet.header.modals.send.hashConfirmation.subtitle')}
        </Typography>
      </Stack>

      <DialogActions>
        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={handleOnClose}>
          {t('common.actions.close')}
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          color="info"
          href={fEtherscanAddress(transactionHash)}
        >
          {t('common.actions.viewOnEtherscan')}
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
        <Typography variant="h6">
          {t('home.wallet.header.modals.send.batchConfirmation.title')}{' '}
        </Typography>
      </Stack>

      <Stack alignItems="center" sx={{ p: 2.5 }}>
        <Typography variant="body2">
          {t('home.wallet.header.modals.send.batchConfirmation.subtitle')}
        </Typography>
      </Stack>

      <DialogActions>
        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={handleOnClose}>
          {t('common.actions.close')}
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
