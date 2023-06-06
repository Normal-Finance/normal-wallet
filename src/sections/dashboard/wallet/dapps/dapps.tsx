// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
// utils
import { fShortenNumber, fCurrency } from 'src/utils/format-number';
// components
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Card } from '@mui/material';
import ConnectionCard from './connection-card';
import { _files } from 'src/_mock';

// ----------------------------------------------------------------------

// type Props = {
//   icon: string;
//   title: string;
//   total: number;
//   percent: number;
//   price: number;
//   color?: string;
// };

export default function Dapps() {
  return (
    <Card
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      <Scrollbar>
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          sx={{ py: 2 }}
        >
          <IconButton color="primary">
            <Iconify icon="eva:plus-fill" />
          </IconButton>

          {_files.slice(0, 3).map((file) => (
            <ConnectionCard
              key={file.id}
              file={file}
              onDelete={() => console.info('DELETE', file.id)}
            />
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}
