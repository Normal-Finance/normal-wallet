// @mui
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Stack, { StackProps } from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Avatar, Button, Tooltip } from '@mui/material';
import Label from 'src/components/label/label';
import { RouterLink } from 'src/routes/components';
import { AnalyticsEvents, useAnalyticsContext } from 'src/contexts/AnalyticsContext';
//

// ----------------------------------------------------------------------

interface Props extends StackProps {
  connection: any;
  onDisconnect: any;
}

export default function ConnectionCard({ connection, onDisconnect, sx, ...other }: Props) {
  const { trackEvent } = useAnalyticsContext();

  const theme = useTheme();

  const smUp = useResponsive('up', 'sm');

  const confirm = useBoolean();

  const details = useBoolean();

  const isLight = theme.palette.mode === 'light';

  const handleOnDisconnect = () => {
    onDisconnect(connection.connectionId, connection.wcVersion);
    trackEvent(AnalyticsEvents.DISCONNECTED_CONNECTED_DAPP, { connection });
    confirm.onFalse();
  };

  const renderAction = (
    <Box
      sx={{
        top: 0,
        right: 8,
        position: 'absolute',
        ...(smUp && {
          flexShrink: 0,
          position: 'unset',
        }),
      }}
    >
      <IconButton
        color="success"
        component={RouterLink}
        href={connection.session.peerMeta.url}
        onClick={() => trackEvent(AnalyticsEvents.VIEWED_CONNECTED_DAPP, { connection })}
      >
        <Iconify icon="eva:external-link-fill" />
      </IconButton>

      <Tooltip title="Disconnect">
        <IconButton color={confirm.value ? 'inherit' : 'default'} onClick={confirm.onTrue}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderText = (
    <ListItemText
      onClick={details.onTrue}
      primary={connection.session.peerMeta.name}
      secondary={
        <Label variant={isLight ? 'soft' : 'filled'} color="success">
          Connected
        </Label>
      }
      primaryTypographyProps={{
        noWrap: true,
        typography: 'subtitle2',
      }}
      secondaryTypographyProps={{
        mt: 0.5,
        component: 'span',
        alignItems: 'center',
        typography: 'caption',
        color: 'text.disabled',
        display: 'inline-flex',
      }}
    />
  );

  return (
    <>
      <Stack
        component={Paper}
        variant="outlined"
        spacing={1}
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'unset', sm: 'center' }}
        sx={{
          borderRadius: 2,
          mr: 2,
          bgcolor: 'unset',
          cursor: 'pointer',
          position: 'relative',
          p: { xs: 2.5, sm: 2 },
          '&:hover': {
            bgcolor: 'background.paper',
            // eslint-disable-next-line @typescript-eslint/no-shadow
            boxShadow: (theme) => theme.customShadows.z20,
          },
          ...sx,
        }}
        {...other}
      >
        <Avatar
          alt="idk"
          src={connection.session.peerMeta.icons[0]}
          sx={{ width: 36, height: 36, mr: 1 }}
        />

        {renderText}

        {renderAction}
      </Stack>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Are you sure you want to disconnect?"
        action={
          <Button variant="contained" color="error" onClick={handleOnDisconnect}>
            Disconnect
          </Button>
        }
      />
    </>
  );
}
