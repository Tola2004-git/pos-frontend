import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { translations } from "../constants/translations";

const STORAGE_KEY = "pos_lang";
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "en",
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((code) => {
    setLangState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === "en" ? "kh" : "en";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = { t: translations[lang], lang, setLang, toggleLang };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslations() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslations must be used within a LanguageProvider");
  }
  return ctx;
}
