// @mui
import { Typography } from '@mui/material';
import { ConnectWallet } from '@thirdweb-dev/react';

export default function Connect() {
  return (
    <>
      <Typography variant="subtitle2" noWrap>
        Connect a wallet to get started
      </Typography>
      <ConnectWallet
        dropdownPosition={{
          align: 'center',
          side: 'bottom',
        }}
        btnTitle="Connect"
      />
    </>
  );
}
