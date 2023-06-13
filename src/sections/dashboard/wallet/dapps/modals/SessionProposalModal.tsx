import React from 'react';
import ProjectInfoCard from 'src/components/walletConnect/ProjectInfoCard';
import ProposalSelectSection from 'src/components/walletConnect/ProposalSelectSection';
import RequestModalContainer from 'src/components/walletConnect/RequestModalContainer';
import SessionProposalChainCard from 'src/components/walletConnect/SessionProposalChainCard';
import ModalStore from 'src/store/ModalStore';
// import { eip155Addresses } from '@/utils/EIP155WalletUtil'
import { isEIP155Chain } from 'src/utils/walletConnect/HelperUtil';
import { Button, Divider, Modal, Typography } from '@mui/material';
// import { SessionTypes } from '@walletconnect/types';
import { Fragment, useState } from 'react';

export default function SessionProposalModal() {
  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, string[]>>({});
  const hasSelected = Object.keys(selectedAccounts).length;

  // Get proposal data and wallet address from store
  const proposal = ModalStore.state.data?.proposal;
  const onApprove = ModalStore.state.data?.onApprove;
  const onReject = ModalStore.state.data?.onReject;

  // Ensure proposal is defined
  if (!proposal) {
    return <Typography>Missing proposal data</Typography>;
  }

  // Get required proposal data
  const { id, params } = proposal;
  const { proposer, requiredNamespaces, relays } = params;

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

  // Hanlde approve action, construct session namespace
  async function _onApprove() {
    if (proposal) {
      onApprove();
    }
    ModalStore.close();
  }

  // Hanlde reject action
  async function _onReject() {
    if (proposal) {
      await onReject();
    }
    ModalStore.close();
  }

  // Render account selection checkboxes based on chain
  function renderAccountSelection(chain: string) {
    if (isEIP155Chain(chain)) {
      return (
        <ProposalSelectSection
          addresses={['0x7D504D497b0ca5386F640aDeA2bb86441462d109']}
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
        <ProjectInfoCard metadata={proposer.metadata} />

        {/* TODO(ilja) Relays selection */}

        <Divider />

        {Object.keys(requiredNamespaces).map((chain) => {
          return (
            <Fragment key={chain}>
              <Typography>{`Review ${chain} permissions`}</Typography>
              <SessionProposalChainCard requiredNamespace={requiredNamespaces[chain]} />
              {renderAccountSelection(chain)}
              <Divider />
            </Fragment>
          );
        })}
      </RequestModalContainer>

      <div>
        <Button color="error" onClick={_onReject}>
          Reject
        </Button>

        <Button
          color="success"
          onClick={_onApprove}
          // disabled={!hasSelected}
          // css={{ opacity: hasSelected ? 1 : 0.4 }}
        >
          Approve
        </Button>
      </div>
    </Fragment>
  );
}
