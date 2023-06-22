import React, { useState } from 'react';
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

export default function LegacySessionSendTransactionModal() {
  const { transactions } = useSelector((state) => state.state);

  const [loading, setLoading] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<TransactionPriority>(
    TransactionPriority.GTC
  );

  const { smartWallet } = useWalletContext();
  const { newTransaction } = useWebsocketContext();

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

  // Get required proposal data

  const { method, params } = requestEvent;
  const transaction = params[0];

  // // Remove unneeded key coming from v1 sample dapp that throws Ethers.
  if (transaction['gas']) delete transaction['gas'];

  const onApprove = async () => {
    if (requestEvent) {
      const { id, method, params } = requestEvent;

      setLoading(true);

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

      setLoading(false);
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
          <Avatar src={requestSession.peerMeta!.icons[0]} />

          <Typography variant="h6">
            {requestSession.peerMeta!.name} Wants to Send / Sign a Transaction
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
              {['eip155:' + chainId].map((chain) => {
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
              {[method].map((method) => (
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
