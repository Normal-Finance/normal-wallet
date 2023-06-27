// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Card, { CardProps } from '@mui/material/Card';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// redux
import { useDispatch } from 'src/redux/store';
// utils
import { fToNow } from 'src/utils/format-time';
// components
import Iconify from 'src/components/iconify';
import { useRouter } from 'src/routes/hook';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { Transaction, TransactionPriority, TransactionStatus } from 'src/types/transaction';
import { CircularProgress, IconButton, Typography } from '@mui/material';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';
import { paths } from 'src/routes/paths';
import TransactionPriorityListDialog from './modals/transaction-priority-list-dialog';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  transactions: Transaction[];
}

export default function TransactionsOverview({ transactions, ...other }: Props) {
  const { updateTransactionPriority, cancelTransaction } = useWebsocketContext();

  const onUpdatePriority = async (transactionId: string, priority: TransactionPriority) => {
    await updateTransactionPriority(transactionId, priority);
  };

  const onCancel = async (transactionId: string) => {
    await cancelTransaction(transactionId);
  };

  return (
    <Card {...other}>
      <CardHeader
        title={'Active Transactions'}
        subheader={"New and pending transactions you've submitted for batching"}
        sx={{ mb: 1 }}
      />

      <Scrollbar>
        {transactions.map((transaction, index) => {
          if (
            transaction.current_status === TransactionStatus.NEW ||
            transaction.current_status === TransactionStatus.PENDING
          ) {
            return (
              <TransactionItem
                key={transaction.transactionId}
                transaction={transaction}
                onCancel={onCancel}
                onUpdatePriority={onUpdatePriority}
              />
            );
          }
        })}
      </Scrollbar>

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
          href={paths.transactions}
        >
          View All
        </Button>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

type TransactionItemProps = {
  transaction: Transaction;
  onCancel: (transactionId: string) => {};
  onUpdatePriority: (transactionId: string, priority: TransactionPriority) => {};
};

function TransactionItem({ transaction, onCancel, onUpdatePriority }: TransactionItemProps) {
  const { transactionId, target, _value, priority, current_status, createdAt } = transaction;

  const router = useRouter();
  const popover = usePopover();
  const confirm = useBoolean();
  const openPriorities = useBoolean();

  const handleOnViewDetails = () => {
    router.push(paths.transactions);
  };

  const handleOnChangePriority = () => {
    onUpdatePriority(transactionId, TransactionPriority.INSTANT);
  };

  const handleOnCancel = () => {
    onCancel(transactionId);
  };

  return (
    <Stack
      spacing={2}
      direction="row"
      alignItems="center"
      sx={{
        py: 2,
        px: 3,
        minWidth: 640,
        borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
      }}
    >
      <Avatar
        variant="rounded"
        src={'/assets/icons/navbar/ic_invoice.svg'}
        sx={{ width: 48, height: 48, flexShrink: 0 }}
      />

      <ListItemText
        primary={`To: ${target}`}
        secondary={
          <Stack direction="row" alignItems="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
            <Typography variant="caption" sx={{ ml: 0.5, mr: 1 }}>
              {priority}
            </Typography>

            <Label color={current_status === TransactionStatus.NEW ? 'success' : 'info'}>
              {current_status}
            </Label>

            {current_status === TransactionStatus.PENDING && (
              <CircularProgress size={24} sx={{ ml: 2 }} />
            )}
          </Stack>
        }
        primaryTypographyProps={{
          noWrap: true,
          typography: 'subtitle2',
        }}
        secondaryTypographyProps={{
          mt: 0.5,
          noWrap: true,
          component: 'span',
        }}
      />

      <Box sx={{ flexShrink: 0, color: 'text.disabled', typography: 'caption' }}>
        {fToNow(createdAt)}
      </Box>

      <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem onClick={handleOnViewDetails}>
          <Iconify icon="solar:document-text-bold" />
          View details
        </MenuItem>

        {priority === TransactionPriority.GTC && (
          <MenuItem onClick={handleOnChangePriority}>
            <Iconify icon="solar:running-2-bold" />
            Make instant
          </MenuItem>
        )}

        {current_status === TransactionStatus.NEW && (
          <>
            <Divider sx={{ borderStyle: 'dashed' }} />

            <MenuItem
              onClick={() => {
                confirm.onTrue();
                popover.onClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
              Cancel
            </MenuItem>
          </>
        )}
      </CustomPopover>

      <TransactionPriorityListDialog
        open={openPriorities.value}
        onClose={openPriorities.onFalse}
        selected={priority}
        onSelect={handleOnChangePriority}
      />

      {current_status === TransactionStatus.NEW && (
        <ConfirmDialog
          open={confirm.value}
          onClose={confirm.onFalse}
          title="Cancel transaction"
          content="Are you sure want to cancel this transaction? Only new and pending transactions can be cancelled. You will not be charged for any gas if cancelled."
          action={
            <Button variant="contained" color="error" onClick={handleOnCancel}>
              Cancel
            </Button>
          }
        />
      )}
    </Stack>
  );
}
