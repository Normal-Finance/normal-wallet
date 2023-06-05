// utils
import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const ROOTS = {
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  payment: '/payment',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    blank: `${ROOTS.DASHBOARD}/blank`,
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      account: `${ROOTS.DASHBOARD}/user/account`,
    },
  },
};
