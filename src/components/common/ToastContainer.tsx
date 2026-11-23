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
            ? 'bg-[#ECF4EE] text-[#1E462A] border-[#BBD6C3]'
            : toast.type === 'error'
              ? 'bg-[#FDF2F4] text-[#8B1E35] border-[#EAC4CC]'
              : 'bg-white text-[#1C1917] border-[#E5E0D8]';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-md transition-transform duration-150 ${accentClass}`}
            role="status"
          >
            <Icon
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                toast.type === 'success'
                  ? 'text-[#1E462A]'
                  : toast.type === 'error'
                    ? 'text-[#8B1E35]'
                    : 'text-[#6E1E2E]'
              }`}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded hover:bg-black/5 text-[#57534E] transition-colors"
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
