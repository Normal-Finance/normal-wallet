import React from 'react';

import ProjectInfoCard from 'src/components/walletConnect/ProjectInfoCard';
import RequesDetailsCard from 'src/components/walletConnect/RequestDetalilsCard';
import RequestMethodCard from 'src/components/walletConnect/RequestMethodCard';
import RequestModalContainer from 'src/components/walletConnect/RequestModalContainer';
import ModalStore from 'src/store/ModalStore';
import { getSignParamsMessage } from 'src/utils/walletConnect/HelperUtil';
import { Button, Divider, Modal, Typography } from '@mui/material';
import { Fragment } from 'react';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from 'src/utils/walletConnect/EIP155RequestHandlerUtil';
import { useWalletContext } from 'src/contexts/WalletContext';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';

export default function LegacySessionSignModal() {
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

  return (
    <Fragment>
      <RequestModalContainer title="Sign Message">
        <ProjectInfoCard metadata={requestSession.peerMeta!} />

        <Divider />

        <RequesDetailsCard chains={['eip155:' + chainId]} protocol={protocol} />

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
