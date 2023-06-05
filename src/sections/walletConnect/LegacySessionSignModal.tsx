import React from 'react';

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
import { legacySignClient } from 'src/utils/walletConnect/LegacyWalletConnectUtil';
import { Button, Divider, Modal, Typography } from '@mui/material';
import { Fragment } from 'react';

export default function LegacySessionSignModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.legacyCallRequestEvent;
  const requestSession = ModalStore.state.data?.legacyRequestSession;

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Typography>Missing request data</Typography>;
  }

  // Get required request data
  const { id, method, params } = requestEvent;

  // Get message, convert it to UTF8 string if it is valid hex
  const message = getSignParamsMessage(params);

  // Handle approve action (logic varies based on request method)
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
      <RequestModalContainer title="Sign Message">
        <ProjectInfoCard metadata={requestSession.peerMeta!} />

        <Divider />

        <RequesDetailsCard
          chains={['eip155:' + legacySignClient.chainId]}
          protocol={legacySignClient.protocol}
        />

        <Divider />

        <div>
          {/* <Col> */}
          <Typography>Message</Typography>
          <Typography color="$gray400">{message}</Typography>
          {/* </Col> */}
        </div>

        <Divider />

        <RequestMethodCard methods={[method]} />
      </RequestModalContainer>

      {/* <Modal.Footer> */}
      <div>
        <Button color="error" onClick={onReject}>
          Reject
        </Button>
        <Button color="success" onClick={onApprove}>
          Approve
        </Button>
        {/* </Modal.Footer> */}
      </div>
    </Fragment>
  );
}
