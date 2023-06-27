import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
// types
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
//
import { TransactionPriority } from 'src/types/transaction';
import Label from 'src/components/label/label';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  selected: TransactionPriority;
  onSelect: (priority: TransactionPriority) => void;
};

export default function TransactionPriorityListDialog({
  open,
  onClose,
  selected,
  onSelect,
}: Props) {
  const TRANSACTION_PRIORITIES = [
    {
      id: TransactionPriority.GTC,
      name: 'Good Till Cancel (GTC)',
      description: 'Optimized for gas savings. Waits for other transactions before being executed.',
    },
    {
      id: TransactionPriority.INSTANT,
      name: 'Instant',
      description: 'Optimzed for speed. Execution is immediate regardless of batch size.',
    },
  ];

  const { enqueueSnackbar } = useSnackbar();

  const handleSelectPriority = useCallback(
    (priority: TransactionPriority) => {
      if (priority === selected)
        enqueueSnackbar(`Transaction priority already set to ${selected}`, { variant: 'error' });
      else {
        onSelect(priority);
        onClose();
      }
    },
    [onClose, onSelect]
  );

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 3, pr: 1.5 }}
      >
        <Typography variant="h6"> Priorities </Typography>
      </Stack>

      <Stack spacing={2.5} sx={{ p: 3 }}>
        {TRANSACTION_PRIORITIES.map((priority) => (
          <Stack
            key={priority.id}
            spacing={1}
            component={Paper}
            variant="outlined"
            onClick={() => handleSelectPriority(priority.id)}
            sx={{
              p: 2.5,
              width: 1,
              position: 'relative',
              cursor: 'pointer',
              ...(selected === priority.id && {
                boxShadow: (theme) => `0 0 0 2px ${theme.palette.text.primary}`,
              }),
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify
                icon={
                  (priority.id === TransactionPriority.GTC && 'solar:clock-circle-bold-duotone') ||
                  'solar:battery-charge-minimalistic-bold-duotone'
                }
                width={36}
              />

              {selected === priority.id && <Label color="success">Active</Label>}
            </Stack>

            <Typography variant="subtitle1">{priority.name}</Typography>

            <Typography variant="subtitle2">{priority.description}</Typography>
          </Stack>
        ))}
      </Stack>
    </Dialog>
  );
}
