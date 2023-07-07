'use client';

import { useState, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// hooks
// utils
// types
import { IWalletTableFilters, IWalletTableFilterValue } from 'src/types/wallet';
// components
import Scrollbar from 'src/components/scrollbar';
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
import { Skeleton, CardHeader } from '@mui/material';
import { OwnedToken } from 'alchemy-sdk';
import { useLocales } from 'src/locales';
import MyTableRow from './table-row';
import TableToolbar from './table-toolbar';
import TableFiltersResult from './table-filters-result';

// ----------------------------------------------------------------------

const defaultFilters = {
  name: '',
  service: [],
  status: 'all',
};

// ----------------------------------------------------------------------

type Props = {
  loading: boolean;
  error: boolean;
  ethereumBalance: number;
  tokenBalances: OwnedToken[];
};

export default function Balances({ loading, error, ethereumBalance, tokenBalances }: Props) {
  const { t } = useLocales();

  const TABLE_HEAD = [
    { id: 'token', label: t('common.words.token') },
    { id: 'balance', label: t('common.words.balance') },
    { id: '' },
  ];

  const table = useTable({ defaultOrderBy: 'createDate' });

  const ethereumToken: OwnedToken = {
    contractAddress: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    rawBalance: '', // TODO: ?
    decimals: 1,
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
    name: 'Ethereum',
    symbol: 'ETH',
    balance: ethereumBalance.toString(),
  };

  const [tableData] = useState([ethereumToken, ...tokenBalances]);

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

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  if (error)
    return (
      <Card>
        <CardHeader
          title={t('home.wallet.balances.table.error.title')}
          subheader={t('home.wallet.balances.table.error.title')}
        />
      </Card>
    );

  return (
    <>
      {/* skeleton load */}
      <Card>
        {loading ? (
          <Skeleton />
        ) : (
          <>
            <TableToolbar filters={filters} onFilters={handleFilters} />

            {canReset && (
              <TableFiltersResult
                filters={filters}
                onFilters={handleFilters}
                onResetFilters={handleResetFilters}
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
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((token, index) => (
                        <MyTableRow key={index} token={token} />
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
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </>
        )}
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
  inputData: OwnedToken[];
  comparator: (a: any, b: any) => number;
  filters: IWalletTableFilters;
}) {
  const {
    name,
    // status, service
  } = filters;

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

  // if (status !== 'all') {
  //   inputData = inputData.filter((invoice) => invoice.status === status);
  // }

  // if (service.length) {
  //   inputData = inputData.filter((invoice) =>
  //     invoice.items.some((filterItem: any) => service.includes(filterItem.service))
  //   );
  // }

  return inputData;
}
