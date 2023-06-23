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
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';

// ----------------------------------------------------------------------

type Props = {
  transaction: AssetTransfersResult;
  selected: boolean;
  onCopyTransactionHash: (hash: string) => void;
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
  const { trackEvent } = useAnalyticsContext();

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
          onClick={() =>
            trackEvent(AnalyticsEvents.VIEWED_BLOCKCHAIN_TRANSACTION_PROPERTY_ON_ETHERSCAN, {
              property: 'blockNumber',
              value: parseInt(blockNum, 16),
            })
          }
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
          <Link
            href={fEtherscanAddress(to || '')}
            rel="noopener noreferrer"
            target="_blank"
            onClick={() =>
              trackEvent(AnalyticsEvents.VIEWED_BLOCKCHAIN_TRANSACTION_PROPERTY_ON_ETHERSCAN, {
                property: 'to',
                value: to,
              })
            }
          >
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
          <Link
            href={fEtherscanAddress(from)}
            rel="noopener noreferrer"
            target="_blank"
            onClick={() =>
              trackEvent(AnalyticsEvents.VIEWED_BLOCKCHAIN_TRANSACTION_PROPERTY_ON_ETHERSCAN, {
                property: 'from',
                value: from,
              })
            }
          >
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
            onCopyTransactionHash(hash);
            popover.onClose();
          }}
        >
          <Iconify icon="solar:copy-bold" />
          Copy hash
        </MenuItem>

        <MenuItem
          href={fEtherscanTx(hash)}
          onClick={() =>
            trackEvent(AnalyticsEvents.VIEWED_BLOCKCHAIN_TRANSACTION_ON_ETHERSCAN, { hash })
          }
        >
          <Iconify icon="solar:eye-bold" />
          Etherscan
        </MenuItem>
      </CustomPopover>
    </>
  );
}
