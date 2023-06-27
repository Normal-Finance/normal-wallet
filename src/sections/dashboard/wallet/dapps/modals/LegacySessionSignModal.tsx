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
import { getSignParamsMessage } from 'src/utils/walletConnect/HelperUtil';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';

export default function LegacySessionSignModal() {
  const { smartWallet } = useWalletContext();
  const { newTransaction } = useWebsocketContext();
  const { trackEvent } = useAnalyticsContext();

  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.legacyCallRequestEvent;
  const requestSession = ModalStore.state.data?.legacyRequestSession;
  const chainId = ModalStore.state.data?.chainId;
  const protocol = ModalStore.state.data?.protocol;
  const connector = ModalStore.state.data?.connector;

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Typography>Missing request data</Typography>;
  }

  // Get required request data
  const { method, params } = requestEvent;

  // Get message, convert it to UTF8 string if it is valid hex
  const message = getSignParamsMessage(params);

  const onApprove = async () => {
    if (requestEvent) {
      const { id, method, params } = requestEvent;

      const response: any = await approveEIP155Request(
        {
          id,
          topic: '',
          params: { request: { method, params }, chainId: '5' },
          context: {
            // undefined
            verified: {
              origin: '',
              validation: 'UNKNOWN',
              verifyUrl: '',
            },
          },
        },
        smartWallet,
        (account: string, target: string, value: string, calldata: string) => {
          newTransaction(account, target, value, calldata);
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

      trackEvent(AnalyticsEvents.APPROVED_SIGN_MESSAGE, { requestEvent });

      ModalStore.close();
    }
  };

  const onReject = () => {
    if (requestEvent) {
      const { id, method, params } = requestEvent;

      const { error } = rejectEIP155Request({
        id,
        topic: '',
        params: { request: { method, params }, chainId: '1' },
        context: {
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

      trackEvent(AnalyticsEvents.REJECTED_SIGN_MESSAGE, { requestEvent });

      ModalStore.close();
    }
  };

  return (
    <Dialog maxWidth="sm" open>
      <DialogTitle> Sign Message </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack spacing={2.5} alignItems="center">
          <Avatar src={requestSession.peerMeta!.icons[0]} />

          <Typography variant="h6">
            {requestSession.peerMeta!.name} Wants to Sign a Message
          </Typography>

          <Divider />

          <CodeBlock showLineNumbers={false} text={message} theme={codepen} language="json" />

          <Divider />

          <Stack spacing={2} direction="row">
            <Typography variant="h6">Blockchain(s)</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              {[`eip155:${  chainId}`].map((chain) => (
                  <Chip
                    key={EIP155_CHAINS[chain as TEIP155Chain]?.name ?? chain}
                    label={EIP155_CHAINS[chain as TEIP155Chain]?.name ?? chain}
                    variant="soft"
                    color="info"
                  />
                ))}
            </Stack>

            <Typography variant="h6">Methods</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              {[method].map((method) => (
                <Chip key={method} label={method} variant="soft" color="warning" />
              ))}
            </Stack>
          </Stack>

          <Divider />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onReject}>
          Cancel
        </Button>
        <Button variant="contained" color="success" onClick={onApprove}>
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}
