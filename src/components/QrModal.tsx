import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function QrModal({ open, onOpenChange, url, code }: { open: boolean; onOpenChange: (o: boolean) => void; url: string; code: string }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader><DialogTitle className="text-center">{t("lobby.qrTitle")}</DialogTitle></DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="rounded-2xl bg-card p-4 shadow-soft">
            <QRCodeSVG value={url} size={240} bgColor="transparent" fgColor="currentColor" className="text-foreground" />
          </div>
          <p className="font-mono text-3xl font-bold tracking-[0.3em]" dir="ltr">{code}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
