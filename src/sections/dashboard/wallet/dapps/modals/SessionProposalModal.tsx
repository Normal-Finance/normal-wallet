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

export default function SessionProposalModal() {
  const proposal = ModalStore.state.data?.proposal;
  const onApprove = ModalStore.state.data?.onApprove;
  const onReject = ModalStore.state.data?.onReject;

  // Ensure proposal is defined
  if (!proposal) {
    return <Typography>Missing proposal data</Typography>;
  }

  // Get required proposal data
  const { params } = proposal;
  const { proposer } = params;

  return (
    <Dialog maxWidth="sm" open>
      <DialogTitle> Session Proposal </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack spacing={2.5} alignItems="center">
          <Avatar src={proposer.metadata.icons[0]} />

          <Typography variant="h6">{proposer.metadata.name} Wants to Connect</Typography>

          <Typography variant="body1">
            You need the Normal web app to be open to initiate transactions. You will not receive
            transaction requests when it is not open.
          </Typography>

          <Link href={proposer.metadata.url}>{proposer.metadata.url}</Link>
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
