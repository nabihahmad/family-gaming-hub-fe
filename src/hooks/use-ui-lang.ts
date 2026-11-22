import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getLang, saveLang } from "@/lib/storage";
import type { Lang } from "@/lib/protocol";

/** Restore the saved UI language after hydration. */
export function useRestoreLang() {
  const { i18n } = useTranslation();
  useEffect(() => {
    const saved = getLang();
    if (saved && saved !== i18n.language) void i18n.changeLanguage(saved);
  }, [i18n]);
}

export function setUiLang(i18n: { changeLanguage: (l: string) => unknown }, l: Lang) {
  saveLang(l);
  void i18n.changeLanguage(l);
}

/** Apply lang/dir to <html>. */
export function useDocumentLang(lang: string) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
}

/** Follow the system color scheme. */
export function useSystemTheme() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
}
