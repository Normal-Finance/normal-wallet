import { useState } from 'react';
import {
  Button,
  CircularProgress,
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

// redux
import { useSelector } from 'src/redux/store';

import ModalStore from 'src/store/ModalStore';
import { EIP155_CHAINS, TEIP155Chain } from 'src/hooks/walletConnect/wcConsts';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from 'src/utils/walletConnect/EIP155RequestHandlerUtil';
import TransactionTypes from '../transaction-types';
import { TransactionPriority } from 'src/types/transaction';

export default function SessionSendTransactionModal() {
  const { transactions } = useSelector((state) => state.state);

  const [loading, setLoading] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<TransactionPriority>(
    TransactionPriority.GTC
  );

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

  // Get required proposal data

  const { topic, params } = requestEvent;
  const { request, chainId } = params;
  const transaction = request.params[0];

  const onApprove = async () => {
    if (requestEvent) {
      setLoading(true);

      const response = await approveEIP155Request(
        requestEvent,
        smartWallet,
        selectedPriority,
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

      setLoading(false);
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

  const onSelectTransactionType = (newValue: TransactionPriority) => {
    setSelectedPriority(newValue);
  };

  return (
    <Dialog maxWidth="sm" open={true}>
      <DialogTitle> Send / Sign Transaction </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack spacing={2.5} alignItems="center">
          <Avatar src={requestSession.peer.metadata.icons[0]} />

          <Typography variant="h6">
            {requestSession.peer.metadata.name} Wants to Send / Sign a Transaction
          </Typography>

          <Divider />

          <CodeBlock
            showLineNumbers={false}
            text={JSON.stringify(transaction, null, 2)}
            theme={codepen}
            language="json"
          />

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

          {/* <transaction> will most likely not satisfy required input type */}
          <TransactionTypes
            newTransactions={transactions.NEW}
            transaction={transaction}
            selected={selectedPriority}
            onSelect={onSelectTransactionType}
          />

          <Divider />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onReject} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" color="success" onClick={onApprove} disabled={loading}>
          {loading ? <CircularProgress size="sm" color="success" /> : 'Approve'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
