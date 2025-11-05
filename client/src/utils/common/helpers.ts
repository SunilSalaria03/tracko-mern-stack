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



export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export const toHours = (hours: number, minutes: number) => {
  const h = Math.max(0, hours | 0);
  const m = clamp(minutes | 0, 0, 59);
  return h + m / 60;
};

export const toDateKey = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate())
    .toISOString()
    .slice(0, 10);

export const formatHours = (hours: number) => {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
};

export const getDisplayId = (o: unknown) => (o as { id?: string; _id?: string })?.id ?? (o as { id?: string; _id?: string })?._id ?? "";

export   const getDayName = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "short" });

export const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

 export const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

 export const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get the end of the week (Sunday)
export const getWeekEnd = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Format date and time for display
export const formatDateTime = (dateString?: string) => {
  return dateString ? new Date(dateString).toLocaleString() : "-";
};

// Get status label for display
export const getStatusLabel = (status?: 0 | 1) => {
  return status === 1 ? "Active" : status === 0 ? "Inactive" : "-";
};


export  const getEventWish = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const month = now.getMonth();
  const date = now.getDate();
  const hour = now.getHours();

   if (month === 0 && date === 1) return "🎉 Happy New Year!";
  if (month === 11 && date === 25) return "🎄 Merry Christmas!";
  if (month === 11 && date === 31) return "🎊 Happy New Year's Eve!";
  if (month === 9 && date === 31) return "🎃 Happy Halloween!";
  if (month === 1 && date === 14) return "💝 Happy Valentine's Day!";
  if (month === 2 && date === 17) return "☘️ Happy St. Patrick's Day!";
  if (month === 6 && date === 4) return "🇺🇸 Happy Independence Day!";

   if (dayOfWeek === 1) return "💪 Happy Monday! Let's make it productive!";
  if (dayOfWeek === 5) return "🎉 Happy Friday! Almost weekend!";
  if (dayOfWeek === 6 || dayOfWeek === 0) return "😊 Happy Weekend!";

   if (hour >= 5 && hour < 12) return "☀️ Good Morning! Start your day strong!";
  if (hour >= 12 && hour < 17) return "🌤️ Good Afternoon! Keep up the momentum!";
  if (hour >= 17 && hour < 21) return "🌆 Good Evening! Finish strong!";

  return "✨ Have a wonderful day!";
};
