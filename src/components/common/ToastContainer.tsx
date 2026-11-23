import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
              ? AlertCircle
              : Info;
        const accentClass =
          toast.type === 'success'
            ? 'bg-[#E7EFD9] text-[#321D17] border-[#C8D8AC]'
            : toast.type === 'error'
              ? 'bg-[#FDECE6] text-[#A83B19] border-[#F6B27B]'
              : 'bg-[#FCEBDD] text-[#321D17] border-[#EAD8C9]';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-sm transition-transform duration-150 ${accentClass}`}
            role="status"
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5 text-[#C84A1B]" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-[#6E4B41] mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded hover:bg-black/5 text-[#6E4B41] transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
