import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
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
  menuItem: icon('ic_menu_item'),
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
          { title: t('home'), path: paths.root, icon: ICONS.banking },
          { title: t('history'), path: paths.history, icon: ICONS.menuItem },
          { title: t('settings'), path: paths.settings, icon: ICONS.account },
        ],
      },
    ],
    [t]
  );

  return data;
}
