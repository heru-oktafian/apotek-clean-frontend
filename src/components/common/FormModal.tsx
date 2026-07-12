import type { ReactNode } from 'react';
import { Modal } from '../ui';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  submitVariant?: 'primary' | 'danger';
  isSubmitting?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: ReactNode;
}

export function FormModal({
  open,
  onClose,
  title,
  children,
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
  cancelLabel = 'Batal',
  submitVariant = 'primary',
  isSubmitting = false,
  size,
  footer,
}: FormModalProps) {
  const handleClose = () => {
    if (isSubmitting) return;
    onCancel?.();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      size={size}
      footer={
        footer ?? (
          <>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </button>
            {onSubmit && (
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-xl text-white transition-colors disabled:opacity-50 ${
                  submitVariant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-primary hover:bg-primary/90'
                }`}
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  submitLabel
                )}
              </button>
            )}
          </>
        )
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(e); }} className="flex flex-col gap-4">
        {children}
      </form>
    </Modal>
  );
}
