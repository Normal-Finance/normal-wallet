import { useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
// hooks
import { useWalletContext } from 'src/contexts/WalletContext';
import { boot, show } from 'src/utils/intercom/intercom';
// utils
import createUserHash from 'src/utils/intercom';
// components
import Label from 'src/components/label';
import { APP_STUFF } from 'src/config-global';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export default function NavUpgrade() {
  const { enqueueSnackbar } = useSnackbar();
  const { walletAddresses } = useWalletContext();

  useEffect(() => {
    try {
      if (walletAddresses.personal) {
        boot({
          userId: walletAddresses.personal,
          userHash: createUserHash(walletAddresses.personal),
        });
      } else {
        boot();
      }
    } catch (error) {
      enqueueSnackbar('Unable to open support chat at this time', { variant: 'error' });
    }
  }, [walletAddresses.personal, enqueueSnackbar]);

  return (
    <Stack
      sx={{
        px: 2,
        py: 5,
        textAlign: 'center',
      }}
    >
      <Stack alignItems="center">
        <Box sx={{ position: 'relative' }}>
          <Avatar src="/logo/logo_single.png" alt="Normal Logo" sx={{ width: 48, height: 48 }} />
          <Label
            color="success"
            variant="filled"
            sx={{
              top: -6,
              px: 0.5,
              left: 40,
              height: 20,
              position: 'absolute',
              borderBottomLeftRadius: 2,
            }}
          >
            Support
          </Label>
        </Box>

        <Stack spacing={0.5} sx={{ mt: 1.5, mb: 2 }}>
          <Typography variant="subtitle2" noWrap>
            Need help?
          </Typography>

          <Typography variant="body2" noWrap sx={{ color: 'text.disabled' }}>
            We&lsquo;'ve got you covered
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Button
            variant="contained"
            href={APP_STUFF.paths.documentation}
            target="_blank"
            rel="noopener"
          >
            Read docs
          </Button>

          <Button variant="contained" onClick={show}>
            Live chat
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
