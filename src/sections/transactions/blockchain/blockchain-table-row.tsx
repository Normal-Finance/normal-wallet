// @mui
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
// utils
import { fEtherscanAddress, fEtherscanBlock, fEtherscanTx } from 'src/utils/format-string';
// types
import { AssetTransfersCategory, AssetTransfersResult } from 'alchemy-sdk';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Tooltip } from '@mui/material';
import Link from 'next/link';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

type Props = {
  transaction: AssetTransfersResult;
  selected: boolean;
  onCopyTransactionHash: VoidFunction;
  onSelectTransaction: VoidFunction;
};

export default function BlockchainTableRow({
  transaction,
  selected,
  onCopyTransactionHash,
  onSelectTransaction,
}: Props) {
  const { uniqueId, category, blockNum, from, to, value, tokenId, asset, hash } = transaction;

  const popover = usePopover();

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectTransaction} />
      </TableCell>

      {/* Block Num */}
      <TableCell>
        <Link
          href={fEtherscanBlock(parseInt(blockNum, 16))}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Box
            sx={{
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {parseInt(blockNum, 16)}
          </Box>
        </Link>
      </TableCell>

      {/* Category */}
      <TableCell>
        <Label
          variant="soft"
          color={
            (category === AssetTransfersCategory.INTERNAL && 'success') ||
            (category === AssetTransfersCategory.EXTERNAL && 'warning') ||
            (category === AssetTransfersCategory.ERC20 && 'info') ||
            'default'
          }
        >
          {category}
        </Label>
      </TableCell>

      {/* To */}
      <TableCell>
        <Tooltip title={to}>
          <Link href={fEtherscanAddress(to || '')} rel="noopener noreferrer" target="_blank">
            <ListItemText
              primary={to !== null ? to.slice(0, 5) + '...' + to.slice(-4) : 'Unknown'}
              primaryTypographyProps={{ typography: 'body2' }}
              secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
            />
          </Link>
        </Tooltip>
      </TableCell>

      {/* From */}
      <TableCell>
        <Tooltip title={from}>
          <Link href={fEtherscanAddress(from)} rel="noopener noreferrer" target="_blank">
            <ListItemText
              primary={from.slice(0, 5) + '...' + from.slice(-4)}
              primaryTypographyProps={{ typography: 'body2' }}
              secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
            />
          </Link>
        </Tooltip>
      </TableCell>

      {/* Value */}
      <TableCell> {value} </TableCell>

      {/* Asset */}
      <TableCell> {asset} </TableCell>

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
        <MenuItem
          onClick={() => {
            onCopyTransactionHash();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:copy-bold" />
          Copy hash
        </MenuItem>

        <MenuItem href={fEtherscanTx(hash)}>
          <Iconify icon="solar:eye-bold" />
          Etherscan
        </MenuItem>
      </CustomPopover>
    </>
  );
}
