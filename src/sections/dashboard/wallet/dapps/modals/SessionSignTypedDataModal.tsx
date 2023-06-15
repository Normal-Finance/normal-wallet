import React, { Fragment } from 'react';
import { Button, Divider, Modal, Typography } from '@mui/material';

import { useWalletContext } from 'src/contexts/WalletContext';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';

import ProjectInfoCard from 'src/components/walletConnect/ProjectInfoCard';
import RequestDataCard from 'src/components/walletConnect/RequestDataCard';
import RequesDetailsCard from 'src/components/walletConnect/RequestDetalilsCard';
import RequestMethodCard from 'src/components/walletConnect/RequestMethodCard';
import RequestModalContainer from 'src/components/walletConnect/RequestModalContainer';
import ModalStore from 'src/store/ModalStore';
import { getSignTypedDataParamsData } from 'src/utils/walletConnect/HelperUtil';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from 'src/utils/walletConnect/EIP155RequestHandlerUtil';

export default function SessionSignTypedDataModal() {
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

  // Get data
  const data = getSignTypedDataParamsData(request.params);

  const onApprove = async () => {
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
  };

  const onReject = async () => {
    const response = rejectEIP155Request(requestEvent);
    await client.respond({
      topic,
      response,
    });
    ModalStore.close();
  };

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
