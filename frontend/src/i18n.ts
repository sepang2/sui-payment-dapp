import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en/translation.json";
import ko from "./locales/ko/translation.json";

const resources = {
  en: {
    translation: en,
  },
  ko: {
    translation: ko,
  },
};

const savedLang = typeof window !== "undefined" ? localStorage.getItem("appLanguage") : undefined;

export function getI18nInstance(lng?: string) {
  if (!i18n.isInitialized) {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        lng: savedLang || "ko", // 저장된 언어가 있으면 그걸로, 없으면 기본값
        fallbackLng: "ko",
        interpolation: {
          escapeValue: false,
        },
        detection: {
          order: ["cookie", "navigator"],
          caches: ["cookie"],
        },
      });
  } else if (lng && i18n.language !== lng) {
    i18n.changeLanguage(lng);
  }
  return i18n;
}

export default i18n;
