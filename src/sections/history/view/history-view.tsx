'use client';

import { useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// redux
import { useSelector } from 'src/redux/store';
// utils
import { fTimestamp } from 'src/utils/format-time';
// types
import { IFileFilters, IFileFilterValue } from 'src/types/file';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import { useTable, getComparator } from 'src/components/table';
import { isDateError } from 'src/components/custom-date-range-picker';
//
import FileManagerTable from '../file-manager-table';
import FileManagerFilters from '../file-manager-filters';
import FileManagerFiltersResult from '../file-manager-filters-result';
import { Transaction } from 'src/types/transaction';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';
import { useWalletContext } from 'src/contexts/WalletContext';
import { paths } from 'src/routes/paths';
import { redirect } from 'next/navigation';

// ----------------------------------------------------------------------

const defaultFilters = {
  target: '',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function HistoryView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { connectionStatus } = useWalletContext();
  const { cancelTransaction } = useWebsocketContext();

  const openDateRange = useBoolean();

  const confirm = useBoolean();

  /** REDUX */
  const { userTransactions } = useSelector((state) => state.state);

  const [tableData, setTableData] = useState(Object.values(userTransactions) || []);

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isDateError(filters.startDate, filters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const canReset = !!filters.target || (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name: string, value: IFileFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteItem = useCallback(
    async (transactionId: string) => {
      await cancelTransaction(transactionId);

      // const deleteRow = tableData.filter((row: any) => row.id !== id);
      // setTableData(deleteRow);

      // table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  if (connectionStatus !== 'connected') {
    enqueueSnackbar('Connect your wallet to view history', { variant: 'info' });
    return redirect(paths.root);
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Transaction History</Typography>
        </Stack>

        <Stack
          spacing={2.5}
          sx={{
            my: { xs: 3, md: 5 },
          }}
        >
          <Stack
            spacing={2}
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-end', md: 'center' }}
          >
            <FileManagerFilters
              openDateRange={openDateRange.value}
              onCloseDateRange={openDateRange.onFalse}
              onOpenDateRange={openDateRange.onTrue}
              //
              filters={filters}
              onFilters={handleFilters}
              //
              dateError={dateError}
            />
          </Stack>

          {canReset && (
            <FileManagerFiltersResult
              filters={filters}
              onResetFilters={handleResetFilters}
              //
              canReset={canReset}
              onFilters={handleFilters}
              //
              results={dataFiltered.length}
            />
          )}
        </Stack>

        {notFound ? (
          <EmptyContent
            filled
            title="No transactions"
            sx={{
              py: 10,
            }}
          />
        ) : (
          <>
            <FileManagerTable
              table={table}
              tableData={tableData}
              dataFiltered={dataFiltered}
              onDeleteRow={handleDeleteItem}
              notFound={notFound}
              onOpenConfirm={confirm.onTrue}
            />
          </>
        )}
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
  dateError,
}: {
  inputData: Transaction[];
  comparator: (a: any, b: any) => number;
  filters: IFileFilters;
  dateError: boolean;
}) {
  const { target, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (target) {
    inputData = inputData.filter(
      (transaction) => transaction.target.toLowerCase().indexOf(target.toLowerCase()) !== -1
    );
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (file) =>
          fTimestamp(file.createdAt) >= fTimestamp(startDate) &&
          fTimestamp(file.createdAt) <= fTimestamp(endDate)
      );
    }
  }

  return inputData;
}
