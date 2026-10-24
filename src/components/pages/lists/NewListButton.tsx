"use client";

import { useState } from "react";
import { ListPlus } from "lucide-react";
import Modal from "@/components/ui/Modal";

export default function NewListButton({ name, creating, onNameChange, onSubmit, t }) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (event) => {
    await onSubmit(event);
    if (!creating) setOpen(false);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex min-h-32 w-full flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[#41413e] bg-[#171716] px-5 text-center text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-current"><ListPlus size={19} aria-hidden="true" /></span>
        <span className="text-sm font-semibold">{t("lists.create")}</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={t("lists.create")} description={t("lists.customHelp")}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-text" htmlFor="new-list-name">{t("lists.namePlaceholder")}</label>
          <input id="new-list-name" name="name" value={name} onChange={(event) => onNameChange(event.target.value)} autoFocus className="min-h-12 w-full rounded-[var(--radius-md)] border border-border bg-transparent px-3 text-sm text-text outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent" placeholder={t("lists.namePlaceholder")} />
          <label className="block text-sm font-medium text-text" htmlFor="new-list-visibility">{t("lists.public")}</label>
          <select id="new-list-visibility" name="visibility" defaultValue="public" className="min-h-12 w-full rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent"><option value="public">{t("lists.public")}</option><option value="private">{t("lists.private")}</option></select>
          <button type="submit" disabled={creating || !name.trim()} className="min-h-11 w-full rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-bg transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50">{creating ? t("common.saving") : t("lists.create")}</button>
        </form>
      </Modal>
    </>
  );
}
