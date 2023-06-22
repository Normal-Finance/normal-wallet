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

export default function SessionSignModal() {
  const { smartWallet } = useWalletContext();
  const { newTransaction } = useWebsocketContext();

  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;
  const client = ModalStore.state.data?.client;

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Typography>Missing request data</Typography>;
  }

  // Get required request data
  const { topic, params } = requestEvent;
  const { request, chainId } = params;

  // Get message, convert it to UTF8 string if it is valid hex
  const message = getSignParamsMessage(request.params);

  const onApprove = async () => {
    if (requestEvent) {
      const response = await approveEIP155Request(
        requestEvent,
        smartWallet,
        (account: string, target: string, value: string, calldata: string) => {
          newTransaction(account, target, value, calldata);
        }
      );
      await client.respond({
        topic,
        response,
      });
      ModalStore.close();
    }
  };

  const onReject = async () => {
    if (requestEvent) {
      const response = rejectEIP155Request(requestEvent);
      await client.respond({
        topic,
        response,
      });
      ModalStore.close();
    }
  };
  return (
    <Dialog maxWidth="sm" open={true}>
      <DialogTitle> Sign Message </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack spacing={2.5} alignItems="center">
          <Avatar src={requestSession.peer.metadata.icons[0]} />

          <Typography variant="h6">
            {requestSession.peer.metadata.name} Wants to Sign a Message
          </Typography>

          <Divider />

          <CodeBlock showLineNumbers={false} text={message} theme={codepen} language="json" />

          <Divider />

          <Stack spacing={2} direction="row">
            <Typography variant="h6">Blockchain(s)</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              {[chainId ?? ''].map((chain) => {
                return (
                  <Chip
                    key={EIP155_CHAINS[chain as TEIP155Chain]?.name ?? chain}
                    label={EIP155_CHAINS[chain as TEIP155Chain]?.name ?? chain}
                    variant="soft"
                    color={'info'}
                  />
                );
              })}
            </Stack>

            <Typography variant="h6">Methods</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              {[request.method].map((method) => (
                <Chip key={method} label={method} variant="soft" color={'warning'} />
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
