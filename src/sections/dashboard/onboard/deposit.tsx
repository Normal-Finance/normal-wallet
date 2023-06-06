import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// @mui
import { Button, Card, Typography, Stack, Avatar, Box } from '@mui/material';

import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

// utils
import { fCurrency } from '../../utils/formatNumber';
import DepositAssetForm from '../modals/DepositAssetForm';

Onboard.propTypes = {
  address: PropTypes.string,
};

export default function Deposit({ address }) {
  const [loading, setLoading] = useState(false);
  const [ethBalance, setEthBalance] = useState();
  const [balances, setBalances] = useState();
  const [selectedAssetIndex, setSelectedAssetIndex] = useState();
  const [openDeposit, setOpenDeposit] = useState(false);

  async function getBalances() {
    setLoading(true);

    const { balance: nativeBalance } = await Moralis.EvmApi.balance.getNativeBalance({
      chain: EvmChain.ETHEREUM,
      address,
    });
    setEthBalance(nativeBalance);

    const walletTokenBalances = await Moralis.EvmApi.token.getWalletTokenBalances({
      address,
      chain: EvmChain.ETHEREUM,
    });
    setBalances(walletTokenBalances);

    setLoading(false);
  }

  useEffect(() => {
    getBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenDeposit = () => {
    setOpenDeposit(true);
  };

  const handleCloseDeposit = () => {
    setOpenDeposit(false);
  };

  return (
    <>
      <Typography variant="subtitle1" noWrap>
        You have {balances.length} of assets in your connected wallet (EOA)
      </Typography>

      <Typography variant="subtitle2" noWrap>
        Migrate them to Normal to start saving
      </Typography>

      <Card sx={{ p: 3 }}>
        {/* <Typography variant="subtitle2" gutterBottom>
          Total balance
        </Typography> */}

        <Stack spacing={2}>
          {/* <Typography variant="h3">{fCurrency(totalAmount)}</Typography> */}

          {/* TODO: add ETH */}

          {/* Assets */}
          {balances.map((asset, index) => (
            <Stack direction="row" alignItems="center" key={index}>
              <Avatar src={asset.logo} sx={{ width: 48, height: 48 }} />

              <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }} noWrap>
                  {asset.balance / asset.decimals} {asset.symbol}
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                  USD value (coming soon)
                </Typography>
              </Box>

              <Button variant="contained" color="warning" onClick={asset.action}>
                Deposit
              </Button>
              {/* <IconButton size="small" onClick={connection.action}>
                <Iconify icon="eva:diagonal-arrow-right-up-fill" width={22} height={22} />
              </IconButton> */}
            </Stack>
          ))}

          <Stack direction="row" spacing={1.5}>
            <Button fullWidth variant="contained">
              Migrate all
            </Button>
          </Stack>
        </Stack>
      </Card>

      {selectedAssetIndex && (
        <DepositAssetForm
          open={openDeposit}
          asset={balances[setSelectedAssetIndex]}
          smartWalletAddress={address}
          onClose={handleCloseDeposit}
        />
      )}
    </>
  );
}
