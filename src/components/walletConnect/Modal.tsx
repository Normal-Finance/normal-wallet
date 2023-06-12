import { useSnapshot } from 'valtio';
import { Dialog } from '@mui/material';

import ModalStore from 'src/store/ModalStore';
import SessionProposalModal from 'src/sections/walletConnect/SessionProposalModal';

import SessionSendTransactionModal from 'src/sections/walletConnect/SessionSendTransactionModal';
import SessionRequestModal from 'src/sections/walletConnect/SessionSignModal';
import SessionSignTypedDataModal from 'src/sections/walletConnect/SessionSignTypedDataModal';
import SessionUnsuportedMethodModal from 'src/sections/walletConnect/SessionUnsuportedMethodModal';
import LegacySessionProposalModal from 'src/sections/walletConnect/LegacySessionProposalModal';
import LegacySessionSignModal from 'src/sections/walletConnect/LegacySessionSignModal';
import LegacySessionSignTypedDataModal from 'src/sections/walletConnect/LegacySessionSignTypedDataModal';
import LegacySessionSendTransactionModal from 'src/sections/walletConnect/LegacySessionSendTransactionModal';

export default function Modal() {
  const { open, view } = useSnapshot(ModalStore.state);

  return (
    <Dialog fullWidth maxWidth="xs" open={open}>
      {view === 'SessionProposalModal' && <SessionProposalModal />}
      {view === 'SessionSignModal' && <SessionRequestModal />}
      {view === 'SessionSignTypedDataModal' && <SessionSignTypedDataModal />}
      {view === 'SessionSendTransactionModal' && <SessionSendTransactionModal />}
      {view === 'SessionUnsuportedMethodModal' && <SessionUnsuportedMethodModal />}
      {view === 'LegacySessionProposalModal' && <LegacySessionProposalModal />}
      {view === 'LegacySessionSignModal' && <LegacySessionSignModal />}
      {view === 'LegacySessionSignTypedDataModal' && <LegacySessionSignTypedDataModal />}
      {view === 'LegacySessionSendTransactionModal' && <LegacySessionSendTransactionModal />}
    </Dialog>
  );
}
