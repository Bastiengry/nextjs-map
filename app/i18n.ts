import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import localeFR from "./locales/locale_fr.json";
import localeEN from "./locales/locale_en.json";

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: localeFR },
    en: { translation: localeEN },
  },
  lng: "fr",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
