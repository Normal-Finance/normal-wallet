import { useSnapshot } from 'valtio';
import { Dialog } from '@mui/material';

import ModalStore from '../store/ModalStore.ts';
import SessionProposalModal from '../views/SessionProposalModal.tsx';

import SessionSendTransactionModal from '../views/SessionSendTransactionModal.tsx';
import SessionRequestModal from '../views/SessionSignModal.tsx';
import SessionSignTypedDataModal from '../views/SessionSignTypedDataModal.tsx';
import SessionUnsuportedMethodModal from '../views/SessionUnsuportedMethodModal.tsx';
import LegacySessionProposalModal from '../views/LegacySessionProposalModal.tsx';
import LegacySessionSignModal from '../views/LegacySessionSignModal.tsx';
import LegacySessionSignTypedDataModal from '../views/LegacySessionSignTypedDataModal.tsx';
import LegacySessionSendTransactionModal from '../views/LegacySessionSendTransactionModal.tsx';

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
