export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateIndianMobile(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
}

export function validatePinCode(pin: string): boolean {
  return /^\d{6}$/.test(pin.trim());
}

export const MAX_CELEBRATION_NOTE_LENGTH = 500;

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
