// @mui
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { Erc20Value } from 'moralis/common-evm-utils';
// components

// ----------------------------------------------------------------------

type Props = {
  row: Erc20Value | any;
};

export default function MyTableRow({ row }: Props) {
  const { value, token } = row.toJSON();

  return (
    <>
      <TableRow hover>
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
      </TableRow>
    </>
  );
}
