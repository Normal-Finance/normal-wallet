// @mui
import { Typography, Stack, Box } from '@mui/material';
import { ConnectWallet } from '@thirdweb-dev/react';
import Iconify from 'src/components/iconify/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';

export default function GetStarted() {
  const { t } = useLocales();
  const { themeMode } = useSettingsContext();

  const FEATURES = [
    t('home.getStarted.features.values.reducedGas'),
    t('home.getStarted.features.values.seamlessTrading'),
    t('home.getStarted.features.values.emailAndSocialRecovery'),
    t('home.getStarted.features.values.payGasWithCreditDebitCard'),
    t('home.getStarted.features.values.openSource'),
    t('home.getStarted.features.values.instantDeFiAndBeyond'),
  ];

  return (
    <Stack sx={{ maxWidth: 720, mx: 'auto' }}>
      <Stack spacing={2} sx={{ mt: 2, mb: 2 }}>
        <Typography variant="body1">{t('home.getStarted.subtitle')}</Typography>

        <Typography variant="h6">{t('home.getStarted.features.title')}</Typography>

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
              key={feature}
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
              {feature}
            </Stack>
          ))}
        </Box>
      </Stack>

      <ConnectWallet
        dropdownPosition={{
          align: 'center',
          side: 'bottom',
        }}
        btnTitle={t('common.actions.connectWallet') || ''}
        theme={themeMode}
      />
    </Stack>
  );
}
