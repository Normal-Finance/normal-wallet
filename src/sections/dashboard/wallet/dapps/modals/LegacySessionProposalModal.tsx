import React from 'react';

import ProjectInfoCard from 'src/components/walletConnect/ProjectInfoCard';
import ProposalSelectSection from 'src/components/walletConnect/ProposalSelectSection';
import RequestModalContainer from 'src/components/walletConnect/RequestModalContainer';
import ModalStore from 'src/store/ModalStore';
import { isEIP155Chain } from 'src/utils/walletConnect/HelperUtil';
import { Button, Divider, Modal, Typography } from '@mui/material';
import { Fragment, useState } from 'react';
import { useWalletContext } from 'src/contexts/WalletContext';

export default function LegacySessionProposalModal() {
  const { smartWalletAddress } = useWalletContext();

  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, string[]>>({});
  const hasSelected = Object.keys(selectedAccounts).length;

  // Get proposal data and wallet address from store
  const proposal = ModalStore.state.data?.legacyProposal;
  const onApprove = ModalStore.state.data?.onApprove;
  const onReject = ModalStore.state.data?.onReject;

  // Ensure proposal is defined
  if (!proposal) {
    return <Typography>Missing proposal data</Typography>;
  }

  // Get required proposal data
  const { id, params } = proposal;
  const [{ chainId, peerMeta }] = params;

  // Add / remove address from EIP155 selection
  function onSelectAccount(chain: string, account: string) {
    if (selectedAccounts[chain]?.includes(account)) {
      const newSelectedAccounts = selectedAccounts[chain]?.filter((a) => a !== account);
      setSelectedAccounts((prev) => ({
        ...prev,
        [chain]: newSelectedAccounts,
      }));
    } else {
      const prevChainAddresses = selectedAccounts[chain] ?? [];
      setSelectedAccounts((prev) => ({
        ...prev,
        [chain]: [...prevChainAddresses, account],
      }));
    }
  }

  // Render account selection checkboxes based on chain
  function renderAccountSelection(chain: string) {
    if (isEIP155Chain(chain)) {
      return (
        <ProposalSelectSection
          addresses={[smartWalletAddress]}
          selectedAddresses={selectedAccounts[chain]}
          onSelect={onSelectAccount}
          chain={chain}
        />
      );
    }
  }

  return (
    <Fragment>
      <RequestModalContainer title="Session Proposal">
        <ProjectInfoCard metadata={peerMeta} />
        <Divider />
        {renderAccountSelection('eip155')}
        <Divider />
      </RequestModalContainer>

      {/* <Modal.Footer> */}
      <div>
        <Button color="error" onClick={onReject}>
          Reject
        </Button>

        {/* <Button
          auto
          flat
          color="success"
          onClick={onApprove}
          disabled={!hasSelected}
          css={{ opacity: hasSelected ? 1 : 0.4 }}
        >
          Approve
        </Button> */}
        <Button color="success" disabled={!hasSelected} onClick={onApprove(selectedAccounts)}>
          Approve
        </Button>
        {/* </Modal.Footer> */}
      </div>
    </Fragment>
  );
}
