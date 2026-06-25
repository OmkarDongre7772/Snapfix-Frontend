import { useEffect, useRef } from "react";
import Button from "./Button";

/**
 * Modal — accessible dialog with backdrop.
 *
 * @param {boolean}  open
 * @param {Function} onClose
 * @param {string}   title
 * @param {string}   description
 * @param {string}   confirmLabel  — defaults to "Confirm"
 * @param {string}   confirmVariant — Button variant, defaults to "danger"
 * @param {Function} onConfirm
 * @param {boolean}  loading
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  onConfirm,
  loading = false,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      className={[
        "rounded-lg border border-border bg-surface p-0 shadow-lg",
        "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
        "w-full max-w-sm mx-auto",
        "open:animate-slide-in",
      ].join(" ")}
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="p-6">
        {title && (
          <h3 id="modal-title" className="text-base font-semibold text-text mb-2">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-text-muted leading-relaxed">{description}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            loading={loading}
            id="modal-confirm-btn"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
