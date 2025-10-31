import { useEffect, useState } from 'react';
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

// Debounce hook for input values
export function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Phone helpers
export const combinedFromParts = (countryCode?: string, phoneNumber?: string) =>
  [countryCode?.trim(), phoneNumber?.trim()].filter(Boolean).join(' ').trim();

export const splitCombinedPhone = (raw: string) => {
  const s = (raw || '').trim();
  const m = s.match(/^\+?\d{1,4}/);
  if (!m) {
    return { cc: '', rest: s };
  }
  const ccRaw = m[0].startsWith('+') ? m[0] : `+${m[0]}`;
  const rest = s.slice(m[0].length).replace(/^[\s-]+/, '');
  return { cc: ccRaw, rest };
};

export const sanitizePhone = (phone: string) => phone.replace(/[^\d\-+() ]/g, '');