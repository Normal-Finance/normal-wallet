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
import { CodeBlock, codepen } from 'react-code-blocks';
import { useWalletContext } from 'src/contexts/WalletContext';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';

import ModalStore from 'src/store/ModalStore';
import { EIP155_CHAINS, TEIP155Chain } from 'src/hooks/walletConnect/wcConsts';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from 'src/utils/walletConnect/EIP155RequestHandlerUtil';
import { getSignTypedDataParamsData } from 'src/utils/walletConnect/HelperUtil';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';
import { TransactionPriority } from 'src/types/transaction';
import { useLocales } from 'src/locales';

export default function SessionSignTypedDataModal() {
  const { t } = useLocales();

  const { smartWallet } = useWalletContext();
  const { newTransaction } = useWebsocketContext();
  const { trackEvent } = useAnalyticsContext();

  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;
  const client = ModalStore.state.data?.client;

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Typography> c </Typography>;
  }

  // Get required request data
  const { topic, params } = requestEvent;
  const { request, chainId } = params;

  // Get data
  const data = getSignTypedDataParamsData(request.params);

  const onApprove = async () => {
    const response = await approveEIP155Request(
      requestEvent,
      smartWallet!,
      null,
      (
        account: string,
        target: string,
        value: string,
        calldata: string,
        priority: TransactionPriority
      ) => {
        newTransaction(account, target, value, calldata, priority);
      }
    );
    await client.respond({
      topic,
      response,
    });
    trackEvent(AnalyticsEvents.APPROVED_SIGN_TYPED_DATA, { requestEvent });
    ModalStore.close();
  };

  const onReject = async () => {
    const response = rejectEIP155Request(requestEvent);
    await client.respond({
      topic,
      response,
    });
    trackEvent(AnalyticsEvents.REJECTED_SIGN_TYPED_DATA, { requestEvent });
    ModalStore.close();
  };

  return (
    <Dialog maxWidth="sm" open>
      <DialogTitle> {t('home.wallet.dapps.modals.signTypedData.header.title')}</DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack spacing={2.5} alignItems="center">
          <Avatar src={requestSession.peer.metadata.icons[0]} />

          <Typography variant="h6">
            {requestSession.peer.metadata.name}{' '}
            {t('home.wallet.dapps.modals.signTypedData.body.title')}
          </Typography>

          <Divider />

          <CodeBlock
            showLineNumbers={false}
            text={JSON.stringify(data, null, 2)}
            theme={codepen}
            language="json"
          />

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
        <Button color="inherit" variant="outlined" onClick={onReject}>
          {t('common.actions.cancel')}
        </Button>
        <Button variant="contained" color="success" onClick={onApprove}>
          {t('common.actions.approve')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
