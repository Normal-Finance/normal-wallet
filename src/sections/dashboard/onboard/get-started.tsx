// @mui
import { Typography, Button } from '@mui/material';

export default function GetStarted() {
  return (
    <>
      <Typography variant="subtitle2" noWrap>
        Connect a Dapp to get started
      </Typography>
      <Button
        variant="contained"
        size="large"
        // startIcon={<Iconify icon="eva:diagonal-arrow-right-up-fill" />}
        // onClick={handleOpenSend}
      >
        Get started
      </Button>
    </>
  );
}
