import PropTypes from 'prop-types';
import { useState } from 'react';
import QRCode from 'react-qr-code';
// @mui
import {
  Stack,
  Dialog,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
// components
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

AddressQRCode.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  address: PropTypes.string,
};

export default function Receive({ open, onClose, address }) {
  const handleCopy = () => {};

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

        <Typography variant="body1" onClick={handleCopy}>
          {address} <Iconify icon="eva:copy-outline" sx={{ color: 'text.disabled' }} />
        </Typography>
      </Stack>
    </Dialog>
  );
}
