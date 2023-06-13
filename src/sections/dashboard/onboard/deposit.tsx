import { useState } from 'react';
// @mui
import { Button, Card, Typography, Stack, Avatar, Box } from '@mui/material';

// utils
import DepositAsset from './modals/DepositAsset';
import { Erc20Value } from 'moralis/common-evm-utils';

type Props = {
  address: string;
  nativeBalance: number;
  tokenBalances: any;
};

export default function Deposit({ address, nativeBalance, tokenBalances }: Props) {
  const hasETH = nativeBalance > 0;
  const numAssets = tokenBalances?.length + (hasETH ? 1 : 0);

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
    setSelectedToken(tokenBalances[index]);
    setOpenDeposit(true);
  };

  return (
    <>
      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle2">
          You have {numAssets} assets in your connected wallet (EOA)
        </Typography>

        <Typography variant="body2">Migrate them to Normal to start saving</Typography>

        <Stack spacing={2} sx={{ mt: 2, mb: 1 }}>
          {/* Assets */}
          {hasETH && (
            <Stack direction="row" alignItems="center">
              <Avatar src={''} sx={{ width: 48, height: 48 }} />

              <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }} noWrap>
                  {nativeBalance} ETH
                </Typography>
              </Box>

              <Button variant="contained" color="warning" onClick={handleSelectNativeToken}>
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
                  color="warning"
                  onClick={() => handleSelectToken(index)}
                >
                  Deposit
                </Button>
              </Stack>
            );
          })}
        </Stack>
      </Card>

      {selectedToken && (
        <DepositAsset
          open={openDeposit}
          token={selectedToken}
          toAddress={address}
          onClose={handleCloseDeposit}
        />
      )}
    </>
  );
}
