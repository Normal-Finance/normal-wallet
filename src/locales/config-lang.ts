// @mui
import { enUS, frFR, zhCN, esES, arSA } from '@mui/material/locale';

// PLEASE REMOVE `LOCAL STORAGE` WHEN YOU CHANGE SETTINGS.
// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: 'English',
    value: 'en',
    systemValue: enUS,
    icon: 'flagpack:us',
  },
  {
    label: 'French',
    value: 'fr',
    systemValue: frFR,
    icon: 'flagpack:fr',
  },
  {
    label: 'Spanish',
    value: 'es',
    systemValue: esES,
    icon: 'flagpack:es',
  },
  {
    label: 'Chinese',
    value: 'cn',
    systemValue: zhCN,
    icon: 'flagpack:cn',
  },
  {
    label: 'Arabic',
    value: 'ar',
    systemValue: arSA,
    icon: 'flagpack:sa',
  },
];

export const defaultLang = allLangs[0]; // English

// GET MORE COUNTRY FLAGS
// https://icon-sets.iconify.design/flagpack/
// https://www.dropbox.com/sh/nec1vwswr9lqbh9/AAB9ufC8iccxvtWi3rzZvndLa?dl=0
