'use client';

// @mui
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// _mock
import { _appFeatured, _appAuthors, _appInstalled, _appRelated, _appInvoices } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
//
import AppWidgetSummary from '../app-widget-summary';
import AppCurrentDownload from '../app-current-download';
import { Typography } from '@mui/material';
import BookingCheckInWidgets from '../booking-check-in-widgets';
import { InvoiceListView } from 'src/sections/overview/app/invoice/view';

// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const { user } = useMockedUser();

  const theme = useTheme();

  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total Transactions"
            percent={2.6}
            total={18765}
            chart={{
              series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total Batches"
            percent={0.2}
            total={4876}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total Savings"
            percent={-0.1}
            total={678}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>

        <Grid xs={12}>
          {/* md={6} lg={4} */}
          <BookingCheckInWidgets
            chart={{
              series: [
                { label: 'Clients', percent: 72, total: 38 },
                { label: 'New transactions', percent: 64, total: 12 },
                { label: 'Pending transactions', percent: 64, total: 4 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12}>
          <InvoiceListView />
        </Grid>

        {/* <div>


              <FileManagerPanel
                title="Recent Files"
                link={paths.dashboard.fileManager}
                onOpen={upload.onTrue}
                sx={{ mt: 2 }}
              />

              <Stack spacing={2}>
                {_files.slice(0, 5).map((file) => (
                  <FileRecentItem
                    key={file.id}
                    file={file}
                    onDelete={() => console.info('DELETE', file.id)}
                  />
                ))}
              </Stack>
            </div> */}
      </Grid>
    </Container>
  );
}
