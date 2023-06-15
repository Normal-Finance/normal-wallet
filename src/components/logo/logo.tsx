import { forwardRef } from 'react';
// @mui
import Link from '@mui/material/Link';
import Box, { BoxProps } from '@mui/material/Box';
// routes
import { RouterLink } from 'src/routes/components';
import { useSettingsContext } from '../settings';

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
  full?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, full = false, sx, ...other }, ref) => {
    const { themeMode } = useSettingsContext();

    const logo = (
      <Box
        component="img"
        src="/logo/logo_single.png"
        sx={{ width: 40, height: 40, cursor: 'pointer', ...sx }}
      />
    );

    const fullLogo = (
      <Box
        component="img"
        src={`/logo/logo_full_${themeMode}_mode.png`}
        sx={{ width: 100, height: 30, cursor: 'pointer', ...sx }}
      />
    );

    if (disabledLink) {
      if (full) return fullLogo;
      else return logo;
    }

    return (
      <Link component={RouterLink} href="/" sx={{ display: 'contents' }}>
        {full ? fullLogo : logo}
      </Link>
    );
  }
);

export default Logo;
