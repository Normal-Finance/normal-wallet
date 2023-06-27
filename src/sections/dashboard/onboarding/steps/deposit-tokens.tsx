import { useEffect, useState } from 'react';
// @mui
import { Stack, Card, Button, CardHeader, Typography, Box, Avatar, Alert } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

// utils
import { useWalletContext } from 'src/contexts/WalletContext';
import { useAlchemyContext } from 'src/contexts/AlchemyContext';
import { OwnedToken } from 'alchemy-sdk';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';
import Iconify from 'src/components/iconify/iconify';
import Receive from '../../wallet/header/modals/Receive';
import DepositAsset from '../modals/DepositAsset';

// ----------------------------------------------------------------------

type Props = {};

export default function DepositTokens({}: Props) {
  const { walletAddresses } = useWalletContext();

  const [ethereumBalance, setEthereumBalance] = useState<number>(0);
  const [tokenBalances, setTokenBalances] = useState<OwnedToken[]>([]);
  const [selectedToken, setSelectedToken] = useState<any>();
  const [openDeposit, setOpenDeposit] = useState(false);
  const [openReceive, setOpenReceive] = useState(false);

  const { getEthereumBalanceOfAddress, getTokenBalancesOfAddress } = useAlchemyContext();
  const { trackEvent } = useAnalyticsContext();

  useEffect(() => {
    if (walletAddresses.personal) fetchBalances(walletAddresses.personal);
  }, [walletAddresses.personal]);

  const handleOpenReceive = () => {
    trackEvent(AnalyticsEvents.OPENED_RECEIVE);
    setOpenReceive(true);
  };

  const handleCloseReceive = () => {
    setOpenReceive(false);
  };

  async function fetchBalances(address: string) {
    const ethereum = await getEthereumBalanceOfAddress(address);
    setEthereumBalance(ethereum);

    const tokens = await getTokenBalancesOfAddress(address);
    setTokenBalances(tokens);
  }

  const handleCloseDeposit = () => {
    setOpenDeposit(false);
  };

  const handleSelectNativeToken = () => {
    const ethToken: OwnedToken = {
      contractAddress: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      rawBalance: '', // TODO: ?
      decimals: 1,
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
      name: 'Ethereum',
      symbol: 'ETH',
      balance: ethereumBalance.toString(),
    };
    setSelectedToken(ethToken);
    setOpenDeposit(true);
  };

  const handleSelectToken = (index: number) => {
    if (tokenBalances) {
      setSelectedToken(tokenBalances[index]);
      setOpenDeposit(true);
    }
  };

  const renderNoTokens = (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2} sx={{ mb: 1 }}>
        <Alert severity="warning">There are no tokens in your connected wallet.</Alert>

        <Typography variant="subtitle2">
          Use your Normal Wallet address to deposit tokens to continue.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:qrcode-2-line" />}
          onClick={handleOpenReceive}
        >
          Show my address
        </Button>
        <Receive open={openReceive} onClose={handleCloseReceive} />
      </Stack>
    </Box>
  );

  const renderTokens = (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2} sx={{ mb: 1 }}>
        {/* Assets */}
        {ethereumBalance > 0 && (
          <Stack direction="row" alignItems="center">
            <Avatar
              src="https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880"
              sx={{ width: 48, height: 48 }}
            />

            <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }} noWrap>
                {ethereumBalance} ETH
              </Typography>
            </Box>

            <Button variant="contained" color="info" onClick={handleSelectNativeToken}>
              Deposit
            </Button>
          </Stack>
        )}

        {tokenBalances.map((token: OwnedToken, index: number) => (
            <Stack direction="row" alignItems="center" key={index}>
              <Avatar src={token.logo} alt={token.name} sx={{ width: 48, height: 48 }} />

              <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }} noWrap>
                  {`${token.balance  } ${  token.symbol}`}
                </Typography>
              </Box>

              <Button variant="contained" color="info" onClick={() => handleSelectToken(index)}>
                Deposit
              </Button>
            </Stack>
          ))}
      </Stack>
    </Box>
  );

  return (
    <Grid xs={12} md={12}>
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Step 1 | Deposit tokens"
          subheader="Move crypto into your Normal Wallet to start saving huge on gas"
          sx={{ mb: 2 }}
        />

        {ethereumBalance || tokenBalances.length > 0 ? renderTokens : renderNoTokens}
      </Card>

      {(ethereumBalance || tokenBalances.length > 0) && selectedToken && (
        <DepositAsset
          open={openDeposit}
          token={selectedToken}
          toAddress={walletAddresses.smart}
          onClose={handleCloseDeposit}
        />
      )}
    </Grid>
  );
}
