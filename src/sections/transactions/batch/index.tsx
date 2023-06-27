'use client';

import { useState, useCallback, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// types
import { IOrderTableFilters, IOrderTableFilterValue } from 'src/types/order';
// utils
// redux
import { useSelector } from 'src/redux/store';
// hooks
// components
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { isDateError } from 'src/components/custom-date-range-picker';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
//
import { Transaction, TransactionStatus } from 'src/types/transaction';
import { fTimestamp } from 'src/utils/format-time';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';
import BatchTableRow from './batch-table-row';
import BatchTableToolbar from './batch-table-toolbar';
import BatchTableFiltersResult from './batch-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const TABLE_HEAD = [
  { id: 'batchId', label: 'Batch', width: 116 },
  { id: 'target', label: 'To', width: 140 },
  { id: '_value', label: 'Value', width: 140 },
  { id: 'priority', label: 'Priority', width: 140 },
  { id: 'current_status', label: 'Status', width: 120 },
  { id: 'createdAt', label: 'Created', width: 140 },
  { id: '', width: 32 },
];

const defaultFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
};

export default function TransactionsBatch() {
  const table = useTable({ defaultOrderBy: 'blockNumber' });

  const settings = useSettingsContext();
  const { trackEvent } = useAnalyticsContext();

  const { userTransactions } = useSelector((state) => state.state);

  const [tableData, setTableData] = useState(userTransactions);

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isDateError(filters.startDate, filters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

  useEffect(() => {
    setTableData(userTransactions);
  }, [userTransactions]);

  const denseHeight = table.dense ? 52 : 72;

  const canReset =
    !!filters.name || filters.status !== 'all' || (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name: string, value: IOrderTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Card>
        <Tabs
          value={filters.status}
          onChange={handleFilterStatus}
          sx={{
            px: 2.5,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {STATUS_OPTIONS.map((tab) => (
            <Tab
              key={tab.value}
              iconPosition="end"
              value={tab.value}
              label={tab.label}
              icon={
                <Label
                  variant={
                    ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                  }
                  color={
                    (tab.value === 'new' && 'info') ||
                    (tab.value === 'pending' && 'warning') ||
                    (tab.value === 'completed' && 'success') ||
                    (tab.value === 'failed' && 'error') ||
                    'default'
                  }
                >
                  {tab.value === 'all' && userTransactions.length}
                  {tab.value === 'new' &&
                    userTransactions.filter(
                      (transaction) => transaction.current_status === TransactionStatus.NEW
                    ).length}

                  {tab.value === 'pending' &&
                    userTransactions.filter(
                      (transaction) => transaction.current_status === TransactionStatus.PENDING
                    ).length}

                  {tab.value === 'completed' &&
                    userTransactions.filter(
                      (transaction) => transaction.current_status === TransactionStatus.COMPLETED
                    ).length}

                  {tab.value === 'failed' &&
                    userTransactions.filter(
                      (transaction) => transaction.current_status === TransactionStatus.FAILED
                    ).length}
                </Label>
              }
            />
          ))}
        </Tabs>

        <BatchTableToolbar
          filters={filters}
          onFilters={handleFilters}
          //
          canReset={canReset}
          onResetFilters={handleResetFilters}
        />

        {canReset && (
          <BatchTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            //
            onResetFilters={handleResetFilters}
            //
            results={dataFiltered.length}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    tableData.map((transaction) => transaction.transactionId)
                  )
                }
              />

              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((transaction) => (
                    <BatchTableRow
                      key={transaction.transactionId}
                      transaction={transaction}
                      selected={table.selected.includes(transaction.transactionId)}
                      onSelectTransaction={() => {
                        table.onSelectRow(transaction.transactionId);
                        trackEvent(AnalyticsEvents.SELECTED_BATCH_TRANSACTION, { transaction });
                      }}
                      onCopyTransactionHash={(hash: string) => {
                        // ...
                        trackEvent(AnalyticsEvents.COPIED_BATCH_TRANSACTION_HASH, { hash });
                      }}
                      onCancelTransaction={() => {}}
                    />
                  ))}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                />

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={dataFiltered.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          //
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Container>
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
  filters: IOrderTableFilters;
  dateError: boolean;
}) {
  const { status, name, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (transaction) =>
        transaction.target?.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        transaction._value.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        transaction.priority?.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        transaction.current_status?.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        transaction.current_status?.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status === 'new') {
    inputData = inputData.filter(
      (transaction) => transaction.current_status === TransactionStatus.NEW
    );
  }

  if (status === 'pending') {
    inputData = inputData.filter(
      (transaction) => transaction.current_status === TransactionStatus.PENDING
    );
  }

  if (status === 'completed') {
    inputData = inputData.filter(
      (transaction) => transaction.current_status === TransactionStatus.COMPLETED
    );
  }

  if (status === 'failed') {
    inputData = inputData.filter(
      (transaction) => transaction.current_status === TransactionStatus.FAILED
    );
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (order) =>
          fTimestamp(order.createdAt) >= fTimestamp(startDate) &&
          fTimestamp(order.createdAt) <= fTimestamp(endDate)
      );
    }
  }

  return inputData;
}
