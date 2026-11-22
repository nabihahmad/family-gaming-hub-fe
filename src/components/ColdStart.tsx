import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function ColdStart() {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background px-8 text-center">
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-14 w-10 rounded-lg bg-primary shadow-soft"
            animate={{ y: [0, -14, 0], rotate: [0, i % 2 ? 8 : -8, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
      <h1 className="text-2xl font-bold">{t("cold.title")}</h1>
      <p className="max-w-xs text-muted-foreground">{t("cold.body")}</p>
    </div>
  );
}
