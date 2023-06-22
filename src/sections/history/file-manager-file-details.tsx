// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Drawer, { DrawerProps } from '@mui/material/Drawer';

// utils
import { fDateTime } from 'src/utils/format-time';
// types
import { Transaction, TransactionStatus } from 'src/types/transaction';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { Tooltip } from '@mui/material';
//

// ----------------------------------------------------------------------

type Props = DrawerProps & {
  item: Transaction;
  favorited?: boolean;
  //
  onClose: VoidFunction;
  onDelete: VoidFunction;
};

export default function FileManagerFileDetails({
  item,
  open,
  //
  // onCopyLink,
  onClose,
  onDelete,
  ...other
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
  } = item;

  const properties = useBoolean(true);

  const renderProperties = (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ typography: 'subtitle2' }}
      >
        Properties
        <IconButton size="small" onClick={properties.onToggle}>
          <Iconify
            icon={properties.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
          />
        </IconButton>
      </Stack>

      {properties.value && (
        <>
          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
              Value
            </Box>
            {_value}
          </Stack>

          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
              Created
            </Box>
            {fDateTime(createdAt)}
          </Stack>

          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
              Target
            </Box>

            {target.slice(0, 5) + '...' + target.slice(-4)}
          </Stack>
        </>
      )}
    </Stack>
  );

  const renderShared = (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
        <Typography variant="subtitle2"> Transaction Data </Typography>
      </Stack>

      <Box sx={{ pl: 2.5, pr: 1 }}>
        <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
            {calldata}
          </Typography>
        </Stack>
      </Box>
    </>
  );

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 320 },
        }}
        {...other}
      >
        <Scrollbar sx={{ height: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
            <Typography variant="h6"> Info </Typography>
          </Stack>

          <Stack
            spacing={2.5}
            justifyContent="center"
            sx={{
              p: 2.5,
              bgcolor: 'background.neutral',
            }}
          >
            <Typography variant="subtitle1" sx={{ wordBreak: 'break-all' }}>
              {transactionId}
            </Typography>

            <Divider sx={{ borderStyle: 'dashed' }} />

            {renderProperties}
          </Stack>

          {renderShared}
        </Scrollbar>

        {current_status === TransactionStatus.NEW && (
          <Box sx={{ p: 2.5 }}>
            <Button
              fullWidth
              variant="soft"
              color="error"
              size="large"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={onDelete}
            >
              Cancel
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  );
}
