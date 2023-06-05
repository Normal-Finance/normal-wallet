import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  banking: icon('ic_banking'),
  account: icon('ic_user'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();

  const data = useMemo(
    () => [
      // WALLET
      // ----------------------------------------------------------------------
      {
        subheader: t('wallet'),
        items: [
          { title: t('home'), path: paths.dashboard.root, icon: ICONS.banking },
          { title: t('settings'), path: paths.dashboard.user.account, icon: ICONS.account },
        ],
      },
    ],
    [t]
  );

  return data;
}
