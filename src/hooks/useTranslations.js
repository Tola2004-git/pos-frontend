import { useState, useCallback } from "react";
import { translations } from "../constants/translations";

const STORAGE_KEY = "pos_lang";

export function useTranslations() {
  const [lang, setLangState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "en",
  );

  const setLang = useCallback((code) => {
    setLangState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "kh" : "en");
  }, [lang, setLang]);

  return { t: translations[lang], lang, setLang, toggleLang };
}
