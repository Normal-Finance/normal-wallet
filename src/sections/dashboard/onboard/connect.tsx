// @mui
import { Typography } from '@mui/material';
import { ConnectWallet } from '@thirdweb-dev/react';
import { useWalletContext } from 'src/contexts/WalletContext';

export default function Connect() {
  const { personalWallet } = useWalletContext();

  if (!personalWallet) {
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
