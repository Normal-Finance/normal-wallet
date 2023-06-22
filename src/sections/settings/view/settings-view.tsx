'use client';

import { useState, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { useWalletContext } from 'src/contexts/WalletContext';
import { redirect } from 'next/navigation';

// Tabs
import SettingsGeneral from '../settings-general';
import SettingsBilling from '../settings-billing';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'billing',
    label: 'Billing',
    icon: <Iconify icon="solar:bill-list-bold" width={24} />,
  },
];

// ----------------------------------------------------------------------

export default function SettingsView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { connectionStatus } = useWalletContext();

  const [currentTab, setCurrentTab] = useState('billing');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  if (connectionStatus !== 'connected') {
    enqueueSnackbar('Connect your wallet to view settings', { variant: 'info' });
    return redirect(paths.root);
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Account"
        links={[
          { name: 'Dashboard', href: paths.root },
          { name: 'Settings', href: paths.settings },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {currentTab === 'general' && <SettingsGeneral />}

      {currentTab === 'billing' && <SettingsBilling />}
    </Container>
  );
}
