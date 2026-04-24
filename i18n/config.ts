import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import sq from "./locales/sq.json";
import de from "./locales/de.json";
import sr from "./locales/sr.json";

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        sq: { translation: sq },
        de: { translation: de },
        sr: { translation: sr },
      },
      fallbackLng: "en",
      supportedLngs: ["en", "sq", "de", "sr"],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
        lookupLocalStorage: "i18nextLng",
      },
    });
}

export default i18n;
