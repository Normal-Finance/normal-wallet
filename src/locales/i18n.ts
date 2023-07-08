'use client';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
// utils
import { localStorageGetItem } from 'src/utils/storage-available';
//
import { defaultLang } from './config-lang';
//
import translationEn from './langs/en.json';
import translationEs from './langs/es.json';
import translationFr from './langs/fr.json';
import translationCn from './langs/cn.json';
import translationAr from './langs/ar.json';
import translationDe from './langs/de.json';
import translationIt from './langs/it.json';
import translationJa from './langs/ja.json';
import translationKo from './langs/ko.json';
import translationPt from './langs/pt.json';
import translationRu from './langs/ru.json';
import translationVi from './langs/vi.json';
import translationHi from './langs/hi.json';
import translationTr from './langs/tr.json';

// ----------------------------------------------------------------------

const lng = localStorageGetItem('i18nextLng', defaultLang.value);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translations: translationEn },
      es: { translations: translationEs },
      fr: { translations: translationFr },
      cn: { translations: translationCn },
      ar: { translations: translationAr },
      de: { translations: translationDe },
      it: { translations: translationIt },
      ja: { translations: translationJa },
      ko: { translations: translationKo },
      pt: { translations: translationPt },
      ru: { translations: translationRu },
      vi: { translations: translationVi },
      hi: { translations: translationHi },
      tr: { translations: translationTr },
    },
    lng,
    fallbackLng: lng,
    debug: false,
    ns: ['translations'],
    defaultNS: 'translations',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
