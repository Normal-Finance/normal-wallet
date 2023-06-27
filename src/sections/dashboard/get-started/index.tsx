// @mui
import { Typography, Stack, Box } from '@mui/material';
import { ConnectWallet } from '@thirdweb-dev/react';
import Iconify from 'src/components/iconify/iconify';
import { useSettingsContext } from 'src/components/settings';

export default function GetStarted() {
  const { themeMode } = useSettingsContext();

  const FEATURES = [
    { value: '90%+ reduced gas', label: '90%+ reduced gas' },
    { value: 'Seamless trading', label: 'Seamless trading' },
    { value: 'Email & social recovery', label: 'Email & social recovery' },
    { value: 'Pay gas with credit/debit card', label: 'Pay gas with credit/debit card' },
    { value: 'Open source', label: 'Open source' },
    { value: 'Instant DeFi and beyond', label: 'Instant DeFi and beyond' },
  ];

  return (
    <Stack sx={{ maxWidth: 720, mx: 'auto' }}>
      <Stack spacing={2} sx={{ mt: 2, mb: 2 }}>
        <Typography variant="body1">
          Connect your wallet to access your new Normal smart wallet and enjoy all these amazing
          features.
        </Typography>

        <Typography variant="h6">Features</Typography>

        <Box
          rowGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
          }}
        >
          {FEATURES.map((feature) => (
            <Stack
              key={feature.label}
              spacing={1}
              direction="row"
              alignItems="center"
              sx={{
                color: 'text.disabled',
              }}
            >
              <Iconify
                icon="eva:checkmark-circle-2-outline"
                sx={{
                  color: 'primary.main',
                  // color: 'text.disabled',
                }}
              />
              {feature.label}
            </Stack>
          ))}
        </Box>
      </Stack>

      <ConnectWallet
        dropdownPosition={{
          align: 'center',
          side: 'bottom',
        }}
        btnTitle="Connect wallet"
        theme={themeMode}
      />
    </Stack>
  );
}
