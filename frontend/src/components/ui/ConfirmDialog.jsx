import Card from "./Card";
import Button from "./Button";

export default function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <Card
        className="w-full max-w-sm animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-dialog-title" className="font-display font-semibold text-base mb-2">
          {title}
        </h3>
        <p className="text-sm text-ink-900/60 dark:text-paper-50/60 mb-5">{description}</p>
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
