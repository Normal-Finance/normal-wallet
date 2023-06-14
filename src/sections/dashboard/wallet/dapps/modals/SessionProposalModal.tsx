import React from 'react';
import ProjectInfoCard from 'src/components/walletConnect/ProjectInfoCard';
import ProposalSelectSection from 'src/components/walletConnect/ProposalSelectSection';
import RequestModalContainer from 'src/components/walletConnect/RequestModalContainer';
import SessionProposalChainCard from 'src/components/walletConnect/SessionProposalChainCard';
import ModalStore from 'src/store/ModalStore';
import { isEIP155Chain } from 'src/utils/walletConnect/HelperUtil';
import { Button, Divider, Modal, Typography } from '@mui/material';
// import { SessionTypes } from '@walletconnect/types';
import { Fragment, useState } from 'react';
import { useWalletContext } from 'src/contexts/WalletContext';

export default function SessionProposalModal() {
  const { smartWalletAddress } = useWalletContext();

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
        <Button color="error" onClick={onReject}>
          Reject
        </Button>

        <Button
          color="success"
          onClick={onApprove}
          disabled={!hasSelected}
          // css={{ opacity: hasSelected ? 1 : 0.4 }}
        >
          Approve
        </Button>
      </div>
    </Fragment>
  );
}
