import React from 'react';

import ProjectInfoCard from 'src/components/walletConnect/ProjectInfoCard';
import RequestDataCard from 'src/components/walletConnect/RequestDataCard';
import RequesDetailsCard from 'src/components/walletConnect/RequestDetalilsCard';
import RequestMethodCard from 'src/components/walletConnect/RequestMethodCard';
import RequestModalContainer from 'src/components/walletConnect/RequestModalContainer';
import ModalStore from 'src/store/ModalStore';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from 'src/utils/walletConnect/EIP155RequestHandlerUtil';
import { legacySignClient } from 'src/utils/walletConnect/LegacyWalletConnectUtil';
import { Button, Divider, CircularProgress, Modal, Typography } from '@mui/material';
import { Fragment, useState } from 'react';

export default function LegacySessionSendTransactionModal() {
  const [loading, setLoading] = useState(false);

  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.legacyCallRequestEvent;
  const requestSession = ModalStore.state.data?.legacyRequestSession;

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Typography>Missing request data</Typography>;
  }

  // Get required proposal data

  const { id, method, params } = requestEvent;
  const transaction = params[0];

  // // Remove unneeded key coming from v1 sample dapp that throws Ethers.
  if (transaction['gas']) delete transaction['gas'];

  // Handle approve action
  async function onApprove() {
    if (requestEvent) {
      const response = await approveEIP155Request({
        id,
        topic: '',
        params: { request: { method, params }, chainId: '1' },
        context: undefined,
      });

      if ('error' in response) {
        legacySignClient.rejectRequest({
          id,
          error: response.error,
        });
      } else {
        legacySignClient.approveRequest({
          id,
          result: response.result,
        });
      }

      ModalStore.close();
    }
  }

  // Handle reject action
  async function onReject() {
    if (requestEvent) {
      const { error } = rejectEIP155Request({
        id,
        topic: '',
        params: { request: { method, params }, chainId: '1' },
        context: undefined,
      });
      legacySignClient.rejectRequest({
        id,
        error,
      });
      ModalStore.close();
    }
  }

  return (
    <Fragment>
      <RequestModalContainer title="Send / Sign Transaction">
        <ProjectInfoCard metadata={requestSession.peerMeta!} />

        <Divider />

        <RequestDataCard data={transaction} />

        <Divider />

        <RequesDetailsCard
          chains={['eip155:' + legacySignClient.chainId]}
          protocol={legacySignClient.protocol}
        />

        <Divider />

        <RequestMethodCard methods={[method]} />
      </RequestModalContainer>

      {/* <Modal.Footer> */}
      <div>
        <Button color="error" onClick={onReject} disabled={loading}>
          Reject
        </Button>
        <Button color="success" onClick={onApprove} disabled={loading}>
          {loading ? <CircularProgress size="sm" color="success" /> : 'Approve'}
        </Button>
        {/* </Modal.Footer> */}
      </div>
    </Fragment>
  );
}
