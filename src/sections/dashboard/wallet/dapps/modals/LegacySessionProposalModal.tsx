import ModalStore from 'src/store/ModalStore';
import {
  Button,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Avatar,
  Link,
} from '@mui/material';

export default function LegacySessionProposalModal() {
  const proposal = ModalStore.state.data?.legacyProposal;
  const onApprove = ModalStore.state.data?.onApprove;
  const onReject = ModalStore.state.data?.onReject;

  // Ensure proposal is defined
  if (!proposal) {
    return <Typography>Missing proposal data</Typography>;
  }

  // Get required proposal data
  const { id, params } = proposal;
  const [{ peerMeta }] = params;

  return (
    <Dialog maxWidth="sm" open>
      <DialogTitle> Session Proposal </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack spacing={2.5} alignItems="center">
          <Avatar src={peerMeta.icons[0]} />

          <Typography variant="h6">{peerMeta.name} Wants to Connect</Typography>

          <Typography variant="body1">
            You need the Normal web app to be open to initiate transactions. You will not receive
            transaction requests when it is not open.
          </Typography>

          <Link href={peerMeta.url}>{peerMeta.url}</Link>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onReject}>
          Cancel
        </Button>
        <Button variant="contained" color="success" onClick={onApprove}>
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}
