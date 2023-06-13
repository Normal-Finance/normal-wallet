// @mui
import { Typography } from '@mui/material';
import { useWallet, ConnectWallet } from '@thirdweb-dev/react';

export default function Connect() {
  const wallet = useWallet();

  if (!wallet) {
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

  return <></>;
}
