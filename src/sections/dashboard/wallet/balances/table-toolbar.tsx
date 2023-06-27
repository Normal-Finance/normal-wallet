import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
// types
import { IWalletTableFilters, IWalletTableFilterValue } from 'src/types/wallet';
// components
import Iconify from 'src/components/iconify';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';

// ----------------------------------------------------------------------

type Props = {
  filters: IWalletTableFilters;
  onFilters: (name: string, value: IWalletTableFilterValue) => void;
};

export default function TableToolbar({
  filters,
  onFilters,
}: //
// serviceOptions,
Props) {
  const { trackEvent } = useAnalyticsContext();

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      trackEvent(AnalyticsEvents.FILTERED_BALANCES_BY_SEARCH, { search: event.target.value });
      onFilters('name', event.target.value);
    },
    [onFilters]
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
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder="Search by name or symbol..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>
  );
}
