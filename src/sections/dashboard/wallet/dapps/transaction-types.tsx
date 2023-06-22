import { useState, useEffect } from 'react';
// @mui
import { Box, Paper, Stack, Skeleton, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
// types
// assets
import { PlanFreeIcon, PlanStarterIcon, PlanPremiumIcon } from 'src/assets/icons';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useAlchemyContext } from 'src/contexts/AlchemyContext';
import { fCurrency } from 'src/utils/format-number';
import { TransactionRequest } from 'alchemy-sdk';
import { TransactionPriority } from 'src/types/transaction';
//

// ----------------------------------------------------------------------

type Props = {
  newTransactions: number;
  transaction: TransactionRequest | null;
  selected: string;
  onSelect: (newValue: TransactionPriority) => void;
};

type TransactionPriorityData = {
  value: TransactionPriority;
  name: string;
  description: string;
  speed: string;
  estimatedGas: number | null;
};

export default function TransactionTypes({
  newTransactions,
  transaction,
  selected,
  onSelect,
}: Props) {
  const { getGasEstimate } = useAlchemyContext();

  const TRANSACTION_PRIORITIES: TransactionPriorityData[] = [
    {
      value: TransactionPriority.TRADITIONAL,
      name: 'Traditional',
      description: 'A regular Ethereum tranasction',
      speed: '1-3 minutes',
      estimatedGas: null,
    },
    {
      value: TransactionPriority.GTC,
      name: 'Batched - Good Till Cancel',
      description: 'Wait for other transactions to be batched',
      speed: 'Unknown',
      estimatedGas: 5 / (newTransactions + 2),
    },
    {
      value: TransactionPriority.INSTANT,
      name: 'Batched - Instant',
      description: 'Immediate execution with awaiting transactions',
      speed: '1-3 minutes',
      estimatedGas: 5 / (newTransactions + 1),
    },
  ];

  useEffect(() => {
    if (transaction) estimateGas(transaction);
  }, [transaction]);

  const estimateGas = async (_transaction: TransactionRequest) =>
    setTraditionalGasEstimate(await getGasEstimate(_transaction));

  const [traditionalGasEstimate, setTraditionalGasEstimate] = useState(null);

  const renderPlans = TRANSACTION_PRIORITIES.map((priority) => (
    <Grid xs={12} md={4} key={priority.name}>
      <Stack
        component={Paper}
        variant="outlined"
        onClick={() => onSelect(priority.value)}
        sx={{
          p: 2.5,
          position: 'relative',
          cursor: 'pointer',
          ...(priority.name === selected && {
            opacity: 0.48,
            cursor: 'default',
          }),
          ...(priority.name === selected && {
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.text.primary}`,
          }),
        }}
      >
        {priority.name === selected && (
          <Label
            color="info"
            startIcon={<Iconify icon="eva:star-fill" />}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            Current
          </Label>
        )}

        <Box sx={{ width: 48, height: 48 }}>
          {priority.name === 'Traditional' && <PlanFreeIcon />}
          {priority.name === 'Batched - Good Till Cancel' && <PlanStarterIcon />}
          {priority.name === 'Batched - Instant' && <PlanPremiumIcon />}
        </Box>

        <Box sx={{ typography: 'subtitle2', mt: 2, mb: 0.5, textTransform: 'capitalize' }}>
          {priority.name}
        </Box>

        <Box sx={{ typography: 'subtitle2', mt: 2, mb: 0.5, textTransform: 'capitalize' }}>
          {priority.speed}
        </Box>

        <Stack direction="row" alignItems="center" sx={{ typography: 'h4' }}>
          {priority.name === 'Traditional' &&
            (traditionalGasEstimate === null ? <Skeleton /> : traditionalGasEstimate)}
          {priority.name === 'Batched - Good Till Cancel' &&
            'Less than ' + fCurrency(priority.estimatedGas)}
          {priority.name === 'Batched - Instant' && 'Approx. ' + fCurrency(priority.estimatedGas)}
        </Stack>
      </Stack>
    </Grid>
  ));

  return (
    <>
      <Typography variant="h6">Transaction Types</Typography>

      <Grid container spacing={2} sx={{ p: 3 }}>
        {renderPlans}
      </Grid>

      <Stack spacing={2} sx={{ p: 3, pt: 0, typography: 'body2' }}>
        <Grid container spacing={{ xs: 0.5, md: 2 }}>
          <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
            Description
          </Grid>
          <Grid xs={12} md={8} sx={{ typography: 'subtitle2', textTransform: 'capitalize' }}>
            {TRANSACTION_PRIORITIES.filter((priority) => priority.name === selected)[0].description}
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}
