// @mui
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { OwnedToken } from 'alchemy-sdk';
// components

// ----------------------------------------------------------------------

type Props = {
  token: OwnedToken;
};

export default function MyTableRow({ token }: Props) {
  return (
    <>
      <TableRow hover>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={token.logo} alt={token.name} sx={{ mr: 2 }}>
            {token.name}
          </Avatar>

          <ListItemText
            disableTypography
            primary={
              <Typography variant="body2" noWrap>
                {token.name}
              </Typography>
            }
            secondary={
              <Typography
                noWrap
                variant="body2"
                // onClick={onViewRow}
                sx={{ color: 'text.disabled', cursor: 'pointer' }}
              >
                {token.balance + ' ' + token.symbol}
              </Typography>
            }
          />
        </TableCell>

        <TableCell>{token.balance}</TableCell>
      </TableRow>
    </>
  );
}
