import { useState } from 'react';
// @mui
import { Stack, Card, Button, CardHeader, Typography, Box, Avatar } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

// moralis
import { useEvmNativeBalance, useEvmWalletTokenBalances } from '@moralisweb3/next';
// import { EvmChain } from 'moralis/common-evm-utils';

// utils
import DepositAsset from '../modals/DepositAsset';
import { Erc20Value } from 'moralis/common-evm-utils';
import { useWalletContext } from 'src/contexts/WalletContext';

// ----------------------------------------------------------------------

type Props = {};

export default function DepositTokens({}: Props) {
  const { personalWalletAddress, smartWalletAddress } = useWalletContext();

  const { data: nativeBalance } = useEvmNativeBalance({
    // chain: process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? EvmChain.ETHEREUM : EvmChain.GOERLI,
    address: personalWalletAddress,
  });
  const { data: tokenBalances } = useEvmWalletTokenBalances({
    // chain: process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? EvmChain.ETHEREUM : EvmChain.GOERLI,
    address: personalWalletAddress,
  });

  const [selectedToken, setSelectedToken] = useState<any>();
  const [openDeposit, setOpenDeposit] = useState(false);

  const handleCloseDeposit = () => {
    setOpenDeposit(false);
  };

  const handleSelectNativeToken = () => {
    setSelectedToken({
      balance: nativeBalance,
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
      name: 'Ethereum',
      decimals: 1,
      symbol: 'ETH',
      token_address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    });
    setOpenDeposit(true);
  };

  const handleSelectToken = (index: number) => {
    if (tokenBalances) {
      setSelectedToken(tokenBalances[index]);
      setOpenDeposit(true);
    }
  };

  if (nativeBalance && tokenBalances)
    return (
      <Grid xs={12} md={12}>
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Step 1 | Deposit tokens"
            subheader="Move crypto into your Normal Wallet to start saving huge on gas"
            sx={{ mb: 3 }}
          />

          <Box sx={{ p: 3 }}>
            <Stack spacing={2} sx={{ mb: 1 }}>
              {/* Assets */}
              {nativeBalance.balance.ether > '0' && (
                <Stack direction="row" alignItems="center">
                  <Avatar
                    src={
                      'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880'
                    }
                    sx={{ width: 48, height: 48 }}
                  />

                  <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }} noWrap>
                      {nativeBalance.balance.ether} ETH
                    </Typography>
                  </Box>

                  <Button variant="contained" color="info" onClick={handleSelectNativeToken}>
                    Deposit
                  </Button>
                </Stack>
              )}

              {tokenBalances.map((token: Erc20Value, index: number) => {
                const { value, token: _token } = token.toJSON();

                return (
                  <Stack direction="row" alignItems="center" key={index}>
                    <Avatar src={_token?.logo || ''} sx={{ width: 48, height: 48 }} />

                    <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }} noWrap>
                        {value + ' ' + _token?.symbol}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      color="info"
                      onClick={() => handleSelectToken(index)}
                    >
                      Deposit
                    </Button>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        </Card>

        {selectedToken && (
          <DepositAsset
            open={openDeposit}
            // TODO: fails when ETH is selected
            token={selectedToken?.toJSON()}
            toAddress={smartWalletAddress}
            onClose={handleCloseDeposit}
          />
        )}
      </Grid>
    );
  else return <></>;
}
