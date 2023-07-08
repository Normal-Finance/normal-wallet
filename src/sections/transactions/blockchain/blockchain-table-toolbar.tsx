import { useCallback } from 'react';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
// types
import { IOrderTableFilters, IOrderTableFilterValue } from 'src/types/order';
// components
import Iconify from 'src/components/iconify';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  filters: IOrderTableFilters;
  onFilters: (name: string, value: IOrderTableFilterValue) => void;
  //
  canReset: boolean;
  onResetFilters: VoidFunction;
};

export default function BlockchainTableToolbar({
  filters,
  onFilters,
  //
  canReset,
  onResetFilters,
}: Props) {
  const { t } = useLocales();
  const { trackEvent } = useAnalyticsContext();

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      trackEvent(AnalyticsEvents.FILTERED_BLOCKCHAIN_TRANSACTIONS_BY_SEARCH, {
        search: event.target.value,
      });
      onFilters('name', event.target.value);
    },
    [onFilters, trackEvent]
  );

  const handleFilterStartDate = useCallback(
    (newValue: Date | null) => {
      trackEvent(AnalyticsEvents.FILTERED_BLOCKCHAIN_TRANSACTIONS_BY_DATE, {
        type: 'startDate',
        date: newValue,
      });
      onFilters('startDate', newValue);
    },
    [onFilters, trackEvent]
  );

  const handleFilterEndDate = useCallback(
    (newValue: Date | null) => {
      trackEvent(AnalyticsEvents.FILTERED_BLOCKCHAIN_TRANSACTIONS_BY_DATE, {
        type: 'endDate',
        date: newValue,
      });
      onFilters('endDate', newValue);
    },
    [onFilters, trackEvent]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        p: 2.5,
        pr: { xs: 2.5, md: 1 },
      }}
    >
      <DatePicker
        label={t('transactions.tabs.blockchain.table.toolbar.date.startDate')}
        value={filters.startDate}
        onChange={handleFilterStartDate}
        slotProps={{
          textField: {
            fullWidth: true,
          },
        }}
        sx={{
          maxWidth: { md: 200 },
        }}
      />

      <DatePicker
        label={t('transactions.tabs.blockchain.table.toolbar.date.endDate')}
        value={filters.endDate}
        onChange={handleFilterEndDate}
        slotProps={{ textField: { fullWidth: true } }}
        sx={{
          maxWidth: { md: 200 },
        }}
      />

      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.name}
          onChange={handleFilterName}
          placeholder={t('transactions.tabs.blockchain.table.toolbar.search.placeholder') || ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {canReset && (
        <Button
          color="error"
          sx={{ flexShrink: 0 }}
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          {t('common.actions.clear')}
        </Button>
      )}
    </Stack>
  );
}
