"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, description, children, className = "" }: ModalProps) {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-bg/80 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
        className={twMerge(
          clsx(
            "w-full max-w-lg rounded-[var(--radius-lg)] border border-border bg-surface p-5 text-text shadow-2xl shadow-black/40 motion-safe:animate-modal-in",
            className,
          ),
        )}
      >
        {(title || onClose) && (
          <header className="mb-4 flex items-start justify-between gap-4">
            <div>
              {title && <h2 id="modal-title" className="font-syne text-xl font-bold">{title}</h2>}
              {description && <p id="modal-description" className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="grid min-h-11 min-w-11 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </header>
        )}
        {children}
      </section>
    </div>
  );
}
