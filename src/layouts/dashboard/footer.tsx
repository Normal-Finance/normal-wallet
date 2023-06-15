// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// routes
import { RouterLink } from 'src/routes/components';
// components
import Logo from 'src/components/logo';
import { APP_STUFF } from 'src/config-global';

// ----------------------------------------------------------------------

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 5,
        textAlign: 'center',
        position: 'relative',
        bgcolor: 'background.default',
      }}
    >
      <Container>
        <Logo full sx={{ mb: 1, mx: 'auto' }} />

        <Typography variant="caption" component="div" sx={{ mb: 2 }}>
          © 2023. All rights reserved
          <br /> made by
          <Link href="https://normalwallet.io"> Normal Finance</Link>
        </Typography>

        <Link component={RouterLink} href={APP_STUFF.paths.helpCenter} sx={{ mr: 2 }}>
          Help Center
        </Link>

        <Link component={RouterLink} href={APP_STUFF.paths.twitter} sx={{ mr: 2 }}>
          Twitter
        </Link>

        <Link component={RouterLink} href={APP_STUFF.paths.discord} sx={{ mr: 2 }}>
          Discord
        </Link>

        <Link component={RouterLink} href={APP_STUFF.paths.github}>
          Github
        </Link>
      </Container>
    </Box>
  );
}
