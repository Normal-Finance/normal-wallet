import React, { Fragment } from 'react';
import { Button, Divider, Modal, Typography } from '@mui/material';

import ProjectInfoCard from 'src/components/walletConnect/ProjectInfoCard';
import RequestDataCard from 'src/components/walletConnect/RequestDataCard';
import RequesDetailsCard from 'src/components/walletConnect/RequestDetalilsCard';
import RequestMethodCard from 'src/components/walletConnect/RequestMethodCard';
import RequestModalContainer from 'src/components/walletConnect/RequestModalContainer';
import ModalStore from 'src/store/ModalStore';
import { getSignTypedDataParamsData } from 'src/utils/walletConnect/HelperUtil';

export default function SessionSignTypedDataModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;
  const onApprove = ModalStore.state.data?.onApprove;
  const onReject = ModalStore.state.data?.onReject;

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Typography>Missing request data</Typography>;
  }

  // Get required request data
  const { topic, params } = requestEvent;
  const { request, chainId } = params;

  // Get data
  const data = getSignTypedDataParamsData(request.params);

  return (
    <Fragment>
      <RequestModalContainer title="Sign Typed Data">
        <ProjectInfoCard metadata={requestSession.peer.metadata} />

        <Divider />

        <RequesDetailsCard chains={[chainId ?? '']} protocol={requestSession.relay.protocol} />

        <Divider />

        <RequestDataCard data={data} />

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
