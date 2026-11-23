import { useApp } from '../context/AppContext';

export function useToast() {
  const { addToast, dismissToast, toasts } = useApp();
  return { addToast, dismissToast, toasts };
}
