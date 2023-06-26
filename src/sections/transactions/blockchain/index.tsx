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
import BlockchainTableRow from './blockchain-table-row';
import BlockchainTableToolbar from './blockchain-table-toolbar';
import BlockchainTableFiltersResult from './blockchain-table-filters-result';
import { AssetTransfersResult } from 'alchemy-sdk';
import { useAlchemyContext } from 'src/contexts/AlchemyContext';
import { useWalletContext } from 'src/contexts/WalletContext';
import { CircularProgress } from '@mui/material';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'incoming', label: 'Incoming' },
  { value: 'outgoing', label: 'Outgoing' },
];

const TABLE_HEAD = [
  { id: 'blockNumber', label: 'Block', width: 116 },
  { id: 'category', label: 'Category' },
  { id: 'to', label: 'To', width: 140 },
  { id: 'from', label: 'From', width: 140 },
  { id: 'value', label: 'Value', width: 120 },
  { id: 'asset', label: 'Asset', width: 140 },
  { id: '', width: 32 },
];

const defaultFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
};

export default function TransactionsBlockchain() {
  const table = useTable({ defaultOrderBy: 'blockNumber' });

  const settings = useSettingsContext();

  const { walletAddresses } = useWalletContext();
  const { loading, transactions } = useAlchemyContext();
  const { trackEvent } = useAnalyticsContext();

  const [tableData, setTableData] = useState(transactions);

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isDateError(filters.startDate, filters.endDate);

  const dataFiltered = applyFilter({
    address: walletAddresses.smart,
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

  useEffect(() => {
    setTableData(transactions);
  }, [transactions]);

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
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Card>
          {loading || (transactions.length === 0 && <CircularProgress />)}

          {!loading && transactions.length > 0 && (
            <>
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
                          ((tab.value === 'all' || tab.value === filters.status) && 'filled') ||
                          'soft'
                        }
                        color={
                          (tab.value === 'incoming' && 'success') ||
                          (tab.value === 'outgoing' && 'info') ||
                          'default'
                        }
                      >
                        {tab.value === 'all' && transactions.length}
                        {tab.value === 'incoming' &&
                          transactions.filter(
                            (transaction) => transaction.to === walletAddresses.smart
                          ).length}

                        {tab.value === 'outgoing' &&
                          transactions.filter(
                            (transaction) => transaction.from === walletAddresses.smart
                          ).length}
                      </Label>
                    }
                  />
                ))}
              </Tabs>

              <BlockchainTableToolbar
                filters={filters}
                onFilters={handleFilters}
                //
                canReset={canReset}
                onResetFilters={handleResetFilters}
              />

              {canReset && (
                <BlockchainTableFiltersResult
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
                          tableData.map((transaction) => transaction.uniqueId)
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
                          <BlockchainTableRow
                            key={transaction.uniqueId}
                            transaction={transaction}
                            selected={table.selected.includes(transaction.uniqueId)}
                            onSelectTransaction={() => {
                              table.onSelectRow(transaction.uniqueId);
                              trackEvent(AnalyticsEvents.SELECTED_BLOCKCHAIN_TRANSACTION, {
                                transaction,
                              });
                            }}
                            onCopyTransactionHash={(hash: string) => {
                              // ...
                              trackEvent(AnalyticsEvents.COPIED_BLOCKCHAIN_TRANSACTION_HASH, {
                                hash,
                              });
                            }}
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
            </>
          )}
        </Card>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  address,
  inputData,
  comparator,
  filters,
  dateError,
}: {
  address: string;
  inputData: AssetTransfersResult[];
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
        transaction.to?.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        transaction.from.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        transaction.asset?.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        transaction.value?.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status === 'incoming') {
    inputData = inputData.filter((transaction) => transaction.to === address);
  }

  if (status === 'outgoing') {
    inputData = inputData.filter((transaction) => transaction.from === address);
  }

  // if (!dateError) {
  //   if (startDate && endDate) {
  //     inputData = inputData.filter(
  //       (order) =>
  //         fTimestamp(order.createdAt) >= fTimestamp(startDate) &&
  //         fTimestamp(order.createdAt) <= fTimestamp(endDate)
  //     );
  //   }
  // }

  return inputData;
}
