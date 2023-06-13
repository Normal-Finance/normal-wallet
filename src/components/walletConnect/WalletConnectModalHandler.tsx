import { useSnapshot } from 'valtio';
import { Dialog } from '@mui/material';

import ModalStore from 'src/store/ModalStore';
import SessionProposalModal from 'src/sections/dashboard/wallet/dapps/modals/SessionProposalModal';

import SessionSendTransactionModal from 'src/sections/dashboard/wallet/dapps/modals/SessionSendTransactionModal';
import SessionRequestModal from 'src/sections/dashboard/wallet/dapps/modals/SessionSignModal';
import SessionSignTypedDataModal from 'src/sections/dashboard/wallet/dapps/modals/SessionSignTypedDataModal';
import SessionUnsuportedMethodModal from 'src/sections/dashboard/wallet/dapps/modals/SessionUnsuportedMethodModal';
import LegacySessionProposalModal from 'src/sections/dashboard/wallet/dapps/modals/LegacySessionProposalModal';
import LegacySessionSignModal from 'src/sections/dashboard/wallet/dapps/modals/LegacySessionSignModal';
import LegacySessionSignTypedDataModal from 'src/sections/dashboard/wallet/dapps/modals/LegacySessionSignTypedDataModal';
import LegacySessionSendTransactionModal from 'src/sections/dashboard/wallet/dapps/modals/LegacySessionSendTransactionModal';

export default function WalletConnectModalHandler() {
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
