import React, { Fragment } from 'react';
import { Button, Divider, Modal, Typography } from '@mui/material';

import ProjectInfoCard from 'src/components/walletConnect/ProjectInfoCard';
import RequesDetailsCard from 'src/components/walletConnect/RequestDetalilsCard';
import RequestMethodCard from 'src/components/walletConnect/RequestMethodCard';
import RequestModalContainer from 'src/components/walletConnect/RequestModalContainer';
import ModalStore from 'src/store/ModalStore';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from 'src/utils/walletConnect/EIP155RequestHandlerUtil';
import { getSignParamsMessage } from 'src/utils/walletConnect/HelperUtil';
import { signClient } from 'src/utils/walletConnect/WalletConnectUtil';

export default function SessionSignModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Typography>Missing request data</Typography>;
  }

  // Get required request data
  const { topic, params } = requestEvent;
  const { request, chainId } = params;

  // Get message, convert it to UTF8 string if it is valid hex
  const message = getSignParamsMessage(request.params);

  // Handle approve action (logic varies based on request method)
  async function onApprove() {
    if (requestEvent) {
      const response = await approveEIP155Request(requestEvent);
      await signClient.respond({
        topic,
        response,
      });
      ModalStore.close();
    }
  }

  // Handle reject action
  async function onReject() {
    if (requestEvent) {
      const response = rejectEIP155Request(requestEvent);
      await signClient.respond({
        topic,
        response,
      });
      ModalStore.close();
    }
  }

  return (
    <Fragment>
      <RequestModalContainer title="Sign Message">
        <ProjectInfoCard metadata={requestSession.peer.metadata} />

        <Divider />

        <RequesDetailsCard chains={[chainId ?? '']} protocol={requestSession.relay.protocol} />

        <Divider />

        {/* <Row>
          <Col> */}
        <div>
          <Typography>Message</Typography>
          <Typography color="$gray400">{message}</Typography>
        </div>
        {/* </Col>
        </Row> */}

        <Divider />

        <RequestMethodCard methods={[request.method]} />
      </RequestModalContainer>

      {/* <Modal.Footer> */}
      <div>
        <Button color="error" onClick={onReject}>
          Reject
        </Button>
        <Button color="success" onClick={onApprove}>
          Approve
        </Button>
      </div>
      {/* </Modal.Footer> */}
    </Fragment>
  );
}
