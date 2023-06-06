// @mui
import { useTheme } from '@mui/material/styles';
import { CardProps } from '@mui/material/Card';
// utils
import { fNumber, fPercent } from 'src/utils/format-number';
// components
import SummaryWidget from './summary-widget';
import RealtimeWidgets from './realtime-widgets';
import { CircularProgress, Grid } from '@mui/material';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  appState: any;
  loading: boolean;
}

export default function Statistics({ appState, loading, sx, ...other }: Props) {
  const theme = useTheme();

  const sumValues = (obj: object) => {
    return Object.values(obj).reduce((a, b) => a + b, 0);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <Grid xs={12} md={4}>
        <SummaryWidget
          title="Total Transactions"
          percent={0}
          total={sumValues(appState?.transaction) || 0}
          chart={{
            series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
          }}
        />
      </Grid>

      <Grid xs={12} md={4}>
        <SummaryWidget
          title="Total Batches"
          percent={0}
          total={sumValues(appState?.batch) || 0}
          chart={{
            colors: [theme.palette.info.light, theme.palette.info.main],
            series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
          }}
        />
      </Grid>

      <Grid xs={12} md={4}>
        <SummaryWidget
          title="Total Savings"
          percent={-0.1}
          total={sumValues(appState?.transaction) * 2.5 || 0}
          chart={{
            colors: [theme.palette.warning.light, theme.palette.warning.main],
            series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
          }}
        />
      </Grid>

      <Grid xs={12}>
        <RealtimeWidgets
          chart={{
            series: [
              {
                label: 'Clients',
                percent: 0,
                total: 0,
              },
              {
                label: 'New transactions',
                percent: appState?.transaction?.NEW,
                total: appState?.transaction?.NEW,
              },
              {
                label: 'Pending transactions',
                percent: appState?.transaction?.PENDING,
                total: appState?.transaction?.PENDING,
              },
            ],
          }}
        />
      </Grid>
    </>
  );
}
