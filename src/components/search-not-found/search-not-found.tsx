import Typography from '@mui/material/Typography';
import Paper, { PaperProps } from '@mui/material/Paper';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

interface Props extends PaperProps {
  query?: string;
}

export default function SearchNotFound({ query, sx, ...other }: Props) {
  const { t } = useLocales();

  return query ? (
    <Paper
      sx={{
        bgcolor: 'unset',
        textAlign: 'center',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h6" gutterBottom>
        {t('header.search.placeholder')}
      </Typography>

      <Typography variant="body2">
        {t('header.search.noResultsFoundFor')} &nbsp;
        <strong>&quot;{query}&quot;</strong>.
        <br /> {t('header.search.tryCheckingForTyposOrUsingCompleteWords')}
      </Typography>
    </Paper>
  ) : (
    <Typography variant="body2" sx={sx}>
      {t('header.search.pleaseEnterKeywords')}
    </Typography>
  );
}
