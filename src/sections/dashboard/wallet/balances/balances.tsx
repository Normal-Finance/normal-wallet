'use client';

import sumBy from 'lodash/sumBy';
import { useState, useCallback } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
// types
import { IWalletTableFilters, IWalletTableFilterValue } from 'src/types/wallet';
// components
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
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
import MyTableRow from './table-row';
import TableToolbar from './table-toolbar';
import TableFiltersResult from './table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'token', label: 'Token' },
  { id: 'balance', label: 'Balance' },
  { id: '' },
];

const defaultFilters = {
  name: '',
  service: [],
  status: 'all',
};

// ----------------------------------------------------------------------

type Props = {
  nativeBalance: number;
  tokenBalances: any;
};

export default function Balances({ nativeBalance, tokenBalances }: Props) {
  const table = useTable({ defaultOrderBy: 'createDate' });

  const [tableData, setTableData] = useState(tokenBalances);

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const denseHeight = table.dense ? 56 : 76;

  const canReset = !!filters.name || !!filters.service.length || filters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name: string, value: IWalletTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <>
      <Card>
        <TableToolbar
          filters={filters}
          onFilters={handleFilters}
          //
          // serviceOptions={INVOICE_SERVICE_OPTIONS.map((option) => option.name)}
        />

        {canReset && (
          <TableFiltersResult
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
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                onSort={table.onSort}
              />

              <TableBody>
                {nativeBalance > 0 && (
                  <MyTableRow
                    key={'ETH'}
                    row={{
                      balance: nativeBalance,
                      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
                      name: 'Ethereum',
                      decimals: 1,
                      symbol: 'ETH',
                      token_address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
                    }}
                  />
                )}
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <MyTableRow key={row.id} row={row} />
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
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: any[];
  comparator: (a: any, b: any) => number;
  filters: IWalletTableFilters;
}) {
  const { name, status, service } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (token: any) =>
        token.name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        token.symbol.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((invoice) => invoice.status === status);
  }

  if (service.length) {
    inputData = inputData.filter((invoice) =>
      invoice.items.some((filterItem: any) => service.includes(filterItem.service))
    );
  }

  return inputData;
}
