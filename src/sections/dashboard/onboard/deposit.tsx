import { useState, useEffect } from 'react';
// @mui
import { Button, Card, Typography, Stack, Avatar, Box } from '@mui/material';

// utils
import { fCurrency } from 'src/utils/format-number';
import DepositAsset from './modals/DepositAsset';
import { Erc20Value } from 'moralis/common-evm-utils';

type Props = {
  nativeBalance: number;
  tokenBalances: any;
};

export default function Deposit({ nativeBalance, tokenBalances }: Props) {
  const hasETH = nativeBalance > 0 || false;
  const numAssets = tokenBalances?.length + (hasETH ? 1 : 0);

  const [selectedAssetIndex, setSelectedAssetIndex] = useState();
  const [openDeposit, setOpenDeposit] = useState(false);

  const handleOpenDeposit = () => {
    setOpenDeposit(true);
  };

  const handleCloseDeposit = () => {
    setOpenDeposit(false);
  };

  return (
    <>
      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle2">
          You have {numAssets} assets in your connected wallet (EOA)
        </Typography>

        <Typography variant="body2">Migrate them to Normal to start saving</Typography>
        {/* <Typography variant="subtitle2" gutterBottom>
          Total balance
        </Typography> */}

        <Stack spacing={2} sx={{ mt: 2, mb: 1 }}>
          {/* <Typography variant="h3">{fCurrency(totalAmount)}</Typography> */}

          {/* Assets */}
          {hasETH && (
            <Stack direction="row" alignItems="center">
              <Avatar src={''} sx={{ width: 48, height: 48 }} />

              <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }} noWrap>
                  {nativeBalance} ETH
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                  USD value (coming soon)
                </Typography>
              </Box>

              <Button variant="contained" color="warning" onClick={() => {}}>
                Deposit
              </Button>
              {/* <IconButton size="small" onClick={connection.action}>
                <Iconify icon="eva:diagonal-arrow-right-up-fill" width={22} height={22} />
              </IconButton> */}
            </Stack>
          )}

          {tokenBalances?.map((token: Erc20Value, index: any) => {
            const { value, token: _token } = token.toJSON();

            return (
              <Stack direction="row" alignItems="center" key={index}>
                <Avatar src={_token?.logo || ''} sx={{ width: 48, height: 48 }} />

                <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }} noWrap>
                    {value + ' ' + _token?.symbol}
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                    USD value (coming soon)
                  </Typography>
                </Box>

                <Button variant="contained" color="warning" onClick={() => {}}>
                  Deposit
                </Button>
                {/* <IconButton size="small" onClick={connection.action}>
                <Iconify icon="eva:diagonal-arrow-right-up-fill" width={22} height={22} />
              </IconButton> */}
              </Stack>
            );
          })}

          <Stack direction="row" spacing={1.5}>
            <Button fullWidth variant="contained" color="primary">
              Migrate all
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* {selectedAssetIndex && (
        <DepositAsset
          open={openDeposit}
          asset={tokenBalances[setSelectedAssetIndex]}
          smartWalletAddress={address}
          onClose={handleCloseDeposit}
        />
      )} */}
    </>
  );
}
