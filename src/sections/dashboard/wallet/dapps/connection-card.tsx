import { useState, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Stack, { StackProps } from '@mui/material/Stack';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// utils
// types
import { IFileManager } from 'src/types/file';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import FileThumbnail from 'src/components/file-thumbnail';
//

// ----------------------------------------------------------------------

interface Props extends StackProps {
  connection: any;
  onDisconnect: VoidFunction;
}

export default function ConnectionCard({ connection, onDisconnect, sx, ...other }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const smUp = useResponsive('up', 'sm');

  const popover = usePopover();

  const details = useBoolean();

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
      <IconButton color="primary" onClick={popover.onOpen}>
        <Iconify icon="eva:external-link-fill" />
      </IconButton>

      <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
    </Box>
  );

  const renderText = (
    <ListItemText
      onClick={details.onTrue}
      primary={connection.session.peerMeta.name}
      secondary={
        <>
          {connection.session.peerMeta.description}
          <Box
            sx={{ mx: 0.75, width: 2, height: 2, borderRadius: '50%', bgcolor: 'currentColor' }}
          />
        </>
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
          bgcolor: 'unset',
          cursor: 'pointer',
          position: 'relative',
          p: { xs: 2.5, sm: 2 },
          '&:hover': {
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          },
          ...sx,
        }}
        {...other}
      >
        {/* <FileThumbnail file={file.type} sx={{ width: 36, height: 36, mr: 1 }} /> */}

        {renderText}

        {renderAction}
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            onDisconnect();
          }}
          sx={{ color: 'error.main' }}
        >
          {/* <Iconify icon="solar:trash-bin-trash-bold" /> */}
          Disconnect
        </MenuItem>
      </CustomPopover>
    </>
  );
}
