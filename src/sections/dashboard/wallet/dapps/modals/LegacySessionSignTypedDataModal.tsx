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

export default function LegacySessionSignTypedDataModal() {
  const { t } = useLocales();

  const { smartWallet } = useWalletContext();
  const { newTransaction } = useWebsocketContext();
  const { trackEvent } = useAnalyticsContext();

  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.legacyCallRequestEvent;
  const requestSession = ModalStore.state.data?.legacyRequestSession;
  const chainId = ModalStore.state.data?.chainId;
  // const protocol = ModalStore.state.data?.protocol;
  const connector = ModalStore.state.data?.connector;

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Typography> {t('home.wallet.dapps.modals.signTypedData.body.title')}</Typography>;
  }

  // Get required request data
  const { id, method, params } = requestEvent;

  // Get data
  const data = getSignTypedDataParamsData(params);

  const onApprove = async () => {
    if (requestEvent) {
      const response: any = await approveEIP155Request(
        {
          id,
          topic: '',
          params: { request: { method, params }, chainId: '5' },
          verifyContext: {
            // undefined
            verified: {
              origin: '',
              validation: 'UNKNOWN',
              verifyUrl: '',
            },
          },
        },
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

      if ('error' in response) {
        connector.rejectRequest({
          id,
          error: response.error,
        });
      } else {
        connector.approveRequest({
          id,
          result: response.result,
        });
      }

      trackEvent(AnalyticsEvents.APPROVED_SIGN_TYPED_DATA, { requestEvent });

      ModalStore.close();
    }
  };

  const onReject = () => {
    if (requestEvent) {
      const { error } = rejectEIP155Request({
        id,
        topic: '',
        params: { request: { method, params }, chainId: '1' },
        verifyContext: {
          // undefined
          verified: {
            origin: '',
            validation: 'UNKNOWN',
            verifyUrl: '',
          },
        },
      });
      connector.rejectRequest({
        id,
        error,
      });

      trackEvent(AnalyticsEvents.REJECTED_SIGN_TYPED_DATA, { requestEvent });

      ModalStore.close();
    }
  };

  return (
    <Dialog maxWidth="sm" open>
      <DialogTitle> {t('home.wallet.dapps.modals.signTypedData.header.title')} </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack spacing={2.5} alignItems="center">
          <Avatar src={requestSession.peerMeta!.icons[0]} />

          <Typography variant="h6">
            {requestSession.peerMeta!.name} {t('home.wallet.dapps.modals.signTypedData.body.title')}
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
              {[method].map((m) => (
                <Chip key={m} label={m} variant="soft" color="warning" />
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
