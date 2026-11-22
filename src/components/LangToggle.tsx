import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { setUiLang } from "@/hooks/use-ui-lang";

export function LangToggle() {
  const { i18n } = useTranslation();
  const next = i18n.language === "ar" ? "en" : "ar";
  return (
    <Button variant="ghost" size="sm" className="h-10" onClick={() => setUiLang(i18n, next)} lang={next}>
      {next === "ar" ? "العربية" : "English"}
    </Button>
  );
}
