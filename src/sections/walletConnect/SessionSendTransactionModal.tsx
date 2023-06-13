import React, { Fragment, useState } from 'react';
import { Button, CircularProgress, Divider, Modal, Typography } from '@mui/material';

import ProjectInfoCard from 'src/components/walletConnect/ProjectInfoCard';
import RequestDataCard from 'src/components/walletConnect/RequestDataCard';
import RequesDetailsCard from 'src/components/walletConnect/RequestDetalilsCard';
import RequestMethodCard from 'src/components/walletConnect/RequestMethodCard';
import RequestModalContainer from 'src/components/walletConnect/RequestModalContainer';
import ModalStore from 'src/store/ModalStore';

export default function SessionSendTransactionModal() {
  const [loading, setLoading] = useState(false);

  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;
  const onApprove = ModalStore.state.data?.onApprove;
  const onReject = ModalStore.state.data?.onReject;

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Typography>Missing request data</Typography>;
  }

  // Get required proposal data

  const { topic, params } = requestEvent;
  const { request, chainId } = params;
  const transaction = request.params[0];

  return (
    <Fragment>
      <RequestModalContainer title="Send / Sign Transaction">
        <ProjectInfoCard metadata={requestSession.peer.metadata} />

        <Divider />

        <RequestDataCard data={transaction} />

        <Divider />

        <RequesDetailsCard chains={[chainId ?? '']} protocol={requestSession.relay.protocol} />

        <Divider />

        <RequestMethodCard methods={[request.method]} />
      </RequestModalContainer>

      {/* <Modal.Footer> */}
      <div>
        <Button color="error" onClick={onReject} disabled={loading}>
          Reject
        </Button>
        <Button color="success" onClick={onApprove(setLoading(true))} disabled={loading}>
          {loading ? <CircularProgress size="sm" color="success" /> : 'Approve'}
        </Button>
      </div>
      {/* </Modal.Footer> */}
    </Fragment>
  );
}
