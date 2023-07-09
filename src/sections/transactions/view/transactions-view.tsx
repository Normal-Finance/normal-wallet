'use client';

import { useState, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useLocales } from 'src/locales';
import TransactionsBlockchain from '../blockchain';
import TransactionsBatch from '../batch';

// ----------------------------------------------------------------------

export default function TransactionsView() {
  const { t } = useLocales();
  const settings = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('blockchain');

  const TABS = [
    {
      value: 'blockchain',
      label: t('common.words.blockchain'),
      icon: <Iconify icon="solar:user-id-bold" width={24} />,
    },
    {
      value: 'batch',
      label: t('common.words.batch'),
      icon: <Iconify icon="solar:bill-list-bold" width={24} />,
    },
  ];

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('common.words.transactions') || ''}
        links={[
          { name: t('common.words.dashboard') || '', href: paths.root },
          { name: t('common.words.transactions') || '' },
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

      {currentTab === 'blockchain' && <TransactionsBlockchain />}

      {currentTab === 'batch' && <TransactionsBatch />}
    </Container>
  );
}
