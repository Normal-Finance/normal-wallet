import QRCode from 'react-qr-code';

// @mui
import { Stack, Dialog, Typography, IconButton } from '@mui/material';

// components
import Iconify from 'src/components/iconify';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  address: string;
  onClose: any;
};

export default function Receive({ open, address, onClose }: Props) {
  const { copy } = useCopyToClipboard();

  const handleCopyAddress = () => copy(address);

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          py: 2,
          pl: 2.5,
          pr: 1,
        }}
      >
        <IconButton onClick={onClose}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </Stack>

      <Stack sx={{ p: 2.5 }}>
        <QRCode value={address} />

        <Typography variant="body1">Your Normal Address</Typography>

        <Typography variant="body1" onClick={handleCopyAddress}>
          {address} <Iconify icon="eva:copy-outline" sx={{ color: 'text.disabled' }} />
        </Typography>
      </Stack>
    </Dialog>
  );
}
