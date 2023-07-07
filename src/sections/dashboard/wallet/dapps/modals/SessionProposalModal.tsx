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
import { useLocales } from 'src/locales';

export default function SessionProposalModal() {
  const { t } = useLocales();

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
      <DialogTitle> {t('home.wallet.dapps.modals.sessionProposal.header.title')} </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack spacing={2.5} alignItems="center">
          <Avatar src={proposer.metadata.icons[0]} />

          <Typography variant="h6">
            {proposer.metadata.name} {t('home.wallet.dapps.modals.sessionProposal.body.title')}{' '}
          </Typography>

          <Typography variant="body1">
            {t('home.wallet.dapps.modals.sessionProposal.body.body')}
          </Typography>

          <Link href={proposer.metadata.url}>{proposer.metadata.url}</Link>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onReject}>
          {t('common.actions.cancel')}
        </Button>
        <Button variant="contained" color="success" onClick={onApprove}>
          {t('common.actions.approve')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
