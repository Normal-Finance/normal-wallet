import {
  Button,
  Divider,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Avatar,
  Chip,
} from '@mui/material';

import ModalStore from 'src/store/ModalStore';
import { EIP155_CHAINS, TEIP155Chain } from 'src/hooks/walletConnect/wcConsts';
import { useLocales } from 'src/locales';

export default function SessionUnsuportedMethodModal() {
  const { t } = useLocales();

  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Typography> {t('home.wallet.dapps.modals.signTypedData.body.title')}</Typography>;
  }

  // Get required request data
  const { params } = requestEvent;
  const { chainId, request } = params;

  return (
    <Dialog maxWidth="sm" open>
      <DialogTitle> {t('home.wallet.dapps.modals.unsupportedMethod.header.title')} </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack spacing={2.5} alignItems="center">
          <Avatar src={requestSession.peer.metadata.icons[0]} />

          <Typography variant="h6">
            {requestSession.peer.metadata.name}{' '}
            {t('home.wallet.dapps.modals.unsupportedMethod.body.title')}
          </Typography>

          <Divider />

          <Stack spacing={2} direction="row">
            <Typography variant="h6">{t('common.words.blockchain')}</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              {[chainId ?? ''].map((chain) => (
                <Chip
                  key={EIP155_CHAINS[chain as TEIP155Chain]?.name ?? chain}
                  label={EIP155_CHAINS[chain as TEIP155Chain]?.name ?? chain}
                  variant="soft"
                  color="info"
                />
              ))}
            </Stack>

            <Typography variant="h6">{t('common.words.methods')}</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              {[request.method].map((method) => (
                <Chip key={method} label={method} variant="soft" color="warning" />
              ))}
            </Stack>
          </Stack>

          <Divider />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={() => ModalStore.close()}>
          {t('common.words.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
