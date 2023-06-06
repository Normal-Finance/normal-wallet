// import { format } from 'date-fns';
// @mui
import Link from '@mui/material/Link';
// import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
// import Divider from '@mui/material/Divider';
// import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
// import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// hooks
// import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fCurrency } from 'src/utils/format-number';
// types
import { IWallet } from 'src/types/wallet';
import { Erc20Token, Erc20Value } from 'moralis/common-evm-utils';
// components
// import Iconify from 'src/components/iconify';
// import { ConfirmDialog } from 'src/components/custom-dialog';
// import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: Erc20Value;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditRow: VoidFunction;
};

export default function MyTableRow({ row, selected, onSelectRow, onEditRow }: Props) {
  const { value, token } = row.toJSON();

  // const confirm = useBoolean();

  // const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={token?.logo || ''} alt={token?.name} sx={{ mr: 2 }}>
            {/* {name.charAt(0).toUpperCase()} */}
            {token?.name}
          </Avatar>

          <ListItemText
            disableTypography
            primary={
              <Typography variant="body2" noWrap>
                {token?.name}
              </Typography>
            }
            secondary={
              <Link
                noWrap
                variant="body2"
                // onClick={onViewRow}
                sx={{ color: 'text.disabled', cursor: 'pointer' }}
              >
                {value + ' ' + token?.symbol}
              </Link>
            }
          />
        </TableCell>

        <TableCell>{value}</TableCell>

        <TableCell>{fCurrency(0)}</TableCell>

        {/* <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell> */}
      </TableRow>

      {/* <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            // onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover> */}
    </>
  );
}
