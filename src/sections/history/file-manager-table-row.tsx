import { format } from 'date-fns';
import { useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme } from '@mui/material/styles';
import TableRow, { tableRowClasses } from '@mui/material/TableRow';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useDoubleClick } from 'src/hooks/use-double-click';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
// utils
import { fData } from 'src/utils/format-number';
// types
import { IFileManager } from 'src/types/file';
// components
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import FileManagerFileDetails from './file-manager-file-details';
import { Transaction, TransactionStatus } from 'src/types/transaction';
import { CircularProgress, Tooltip } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  row: Transaction;
  selected: boolean;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function FileManagerTableRow({ row, selected, onSelectRow, onDeleteRow }: Props) {
  const theme = useTheme();

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
  } = row;

  const isLight = theme.palette.mode === 'light';

  const currentStatusColorMap = {
    [TransactionStatus.NEW]: 'info',
    [TransactionStatus.REVERTED]: 'error',
    [TransactionStatus.PENDING]: 'warning',
    [TransactionStatus.COMPLETED]: 'success',
    [TransactionStatus.FAILED]: 'error',
  };

  const { enqueueSnackbar } = useSnackbar();

  const { copy } = useCopyToClipboard();

  // const favorite = useBoolean(isFavorited);

  const details = useBoolean();

  const share = useBoolean();

  const confirm = useBoolean();

  const popover = usePopover();

  const handleClick = useDoubleClick({
    click: () => {
      details.onTrue();
    },
    doubleClick: () => console.info('DOUBLE CLICK'),
  });

  // const handleCopy = useCallback(() => {
  //   enqueueSnackbar('Copied!');
  //   copy(row.url);
  // }, [copy, enqueueSnackbar, row.url]);

  const defaultStyles = {
    borderTop: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    borderBottom: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    '&:first-of-type': {
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
      borderLeft: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    },
    '&:last-of-type': {
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      borderRight: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    },
  };

  return (
    <>
      <TableRow
        selected={selected}
        sx={{
          borderRadius: 2,
          [`&.${tableRowClasses.selected}, &:hover`]: {
            backgroundColor: 'background.paper',
            boxShadow: theme.customShadows.z20,
            transition: theme.transitions.create(['background-color', 'box-shadow'], {
              duration: theme.transitions.duration.shortest,
            }),
            '&:hover': {
              backgroundColor: 'background.paper',
              boxShadow: theme.customShadows.z20,
            },
          },
          [`& .${tableCellClasses.root}`]: {
            ...defaultStyles,
          },
          ...(details.value && {
            [`& .${tableCellClasses.root}`]: {
              ...defaultStyles,
            },
          }),
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onDoubleClick={() => console.info('ON DOUBLE CLICK')}
            onClick={onSelectRow}
          />
        </TableCell>

        <TableCell onClick={handleClick}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Tooltip title={target}>
              <Typography
                noWrap
                variant="inherit"
                sx={{
                  maxWidth: 360,
                  cursor: 'pointer',
                  ...(details.value && { fontWeight: 'fontWeightBold' }),
                }}
              >
                {target.slice(0, 5) + '...' + target.slice(-4)}
              </Typography>
            </Tooltip>
          </Stack>
        </TableCell>

        <TableCell onClick={handleClick} sx={{ whiteSpace: 'nowrap' }}>
          {_value}
        </TableCell>

        <TableCell onClick={handleClick} sx={{ whiteSpace: 'nowrap' }}>
          <ListItemText
            primary={format(new Date(createdAt), 'MMM dd, yyyy')}
            secondary={format(new Date(createdAt), 'p')}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        <TableCell onClick={handleClick} sx={{ whiteSpace: 'nowrap' }}>
          <Label
            variant={isLight ? 'soft' : 'filled'}
            color={(priority === 'GTC' && 'info') || 'success'}
          >
            {priority}
          </Label>
        </TableCell>

        <TableCell onClick={handleClick} sx={{ whiteSpace: 'nowrap' }}>
          <Label
            variant={isLight ? 'soft' : 'filled'}
            color={currentStatusColorMap[current_status] as any}
          >
            {current_status}
          </Label>
        </TableCell>

        <TableCell
          align="right"
          sx={{
            px: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {current_status === TransactionStatus.NEW && (
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
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
      </CustomPopover>

      <FileManagerFileDetails
        item={row}
        // onCopyLink={handleCopy}
        open={details.value}
        onClose={details.onFalse}
        onDelete={onDeleteRow}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Cancel transaction"
        content="Are you sure want to cancel this transaction? Only new and pending transactions can be cancelled. You will not be charged for any gas if cancelled."
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Cancel
          </Button>
        }
      />
    </>
  );
}
