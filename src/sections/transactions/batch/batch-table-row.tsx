import { format } from 'date-fns';
// @mui
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
// hooks
// utils
import { fEtherscanAddress, fEtherscanBlock, fEtherscanTx } from 'src/utils/format-string';
// types
import { Transaction, TransactionPriority, TransactionStatus } from 'src/types/transaction';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Button, IconButton, Skeleton, Tooltip } from '@mui/material';
import Link from 'next/link';
import { useBoolean } from 'src/hooks/use-boolean';
// ----------------------------------------------------------------------

type Props = {
  transaction: Transaction;
  selected: boolean;
  onCopyTransactionHash: VoidFunction;
  onSelectTransaction: VoidFunction;
  onCancelTransaction: VoidFunction;
};

export default function BatchTableRow({
  transaction,
  selected,
  onCopyTransactionHash,
  onSelectTransaction,
  onCancelTransaction,
}: Props) {
  const {
    transactionId,
    account,
    target,
    _value,
    calldata,
    priority,
    current_status,
    batchId,
    createdAt,
    updatedAt,
  } = transaction;

  const confirm = useBoolean();

  const popover = usePopover();

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectTransaction} />
      </TableCell>

      {/* Block Num */}
      <TableCell>
        {batchId === '0x0' ? (
          <Skeleton />
        ) : (
          <Tooltip title={batchId}>
            <Box
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {batchId.length > 3 ? batchId.slice(0, 5) + '...' + batchId.slice(-4) : batchId}
            </Box>
          </Tooltip>
        )}
      </TableCell>

      {/* Target */}
      <TableCell>
        <Tooltip title={target}>
          <Link href={fEtherscanAddress(target)} rel="noopener noreferrer" target="_blank">
            <ListItemText
              primary={target.slice(0, 5) + '...' + target.slice(-4)}
              primaryTypographyProps={{ typography: 'body2' }}
              secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
            />
          </Link>
        </Tooltip>
      </TableCell>

      {/* Value */}
      <TableCell> {_value} </TableCell>

      {/* Priority */}
      <TableCell>
        <Label
          variant="soft"
          color={
            (priority === TransactionPriority.GTC && 'info') ||
            (priority === TransactionPriority.INSTANT && 'success') ||
            'default'
          }
        >
          {priority}
        </Label>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Label
          variant="soft"
          color={
            (current_status === TransactionStatus.NEW && 'info') ||
            (current_status === TransactionStatus.PENDING && 'warning') ||
            (current_status === TransactionStatus.COMPLETED && 'success') ||
            (current_status === TransactionStatus.FAILED && 'error') ||
            'default'
          }
        >
          {current_status}
        </Label>
      </TableCell>

      {/* Created At */}
      <TableCell>
        <ListItemText
          primary={format(new Date(createdAt), 'MMM dd, yyyy')}
          secondary={format(new Date(createdAt), 'p')}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {batchId !== '0x0' && (
          <>
            <MenuItem
              onClick={() => {
                onCopyTransactionHash();
                popover.onClose();
              }}
            >
              <Iconify icon="solar:copy-bold" />
              Copy hash
            </MenuItem>

            <MenuItem href={fEtherscanTx(batchId)}>
              <Iconify icon="solar:eye-bold" />
              Etherscan
            </MenuItem>
          </>
        )}

        {priority === TransactionPriority.GTC && (
          <MenuItem
            onClick={() => {
              // confirm.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:running-2-bold" />
            Make instant
          </MenuItem>
        )}

        {current_status === TransactionStatus.NEW && (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        )}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Cancel transaction"
        content="Are you sure want to cancel this transaction? Only new and pending transactions can be cancelled. You will not be charged for any gas if cancelled."
        action={
          <Button variant="contained" color="error" onClick={onCancelTransaction}>
            Cancel
          </Button>
        }
      />
    </>
  );
}
