/* Field checks shared by the auth and dashboard actions. Kept dependency-free
   on purpose — swap in Zod or Valibot if the rules grow past this.

   Every checker returns an error message, or null when the value is fine.
   Empty values pass the format checkers: whether a field is *required* is
   decided at submission time (see lib/application/progress.ts), so founders
   can save a half-finished draft. */

export type FieldErrors = Record<string, string>;

/** Deliberately loose: the only real proof an address works is a sent email. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function readString(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function checkName(value: string) {
  if (!value) return "Enter your full name.";
  if (value.length < 2) return "That name looks too short.";
  if (value.length > 80) return "That name is too long.";
  return null;
}

export function checkEmail(value: string) {
  if (!value) return "Enter your email address.";
  if (value.length > 254 || !EMAIL.test(value))
    return "That doesn't look like a valid email address.";
  return null;
}

/** Register only — login just checks the field isn't empty. */
export function checkNewPassword(value: string) {
  if (!value) return "Choose a password.";
  if (value.length < 8) return "Use at least 8 characters.";
  if (value.length > 200) return "That password is too long.";
  if (!/[a-zA-Z]/.test(value)) return "Include at least one letter.";
  if (!/[0-9]/.test(value)) return "Include at least one number.";
  return null;
}

/* ---------- Optional-field format checks (dashboard) ---------- */

export function maxLength(value: string, max: number) {
  return value.length > max ? `Keep this under ${max} characters.` : null;
}

export function optionalEmail(value: string) {
  return value ? checkEmail(value) : null;
}

/** Accepts "acme.com" as well as full URLs; saves always carry a scheme. */
export function normalizeUrl(value: string) {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function optionalUrl(value: string) {
  if (!value) return null;
  try {
    const url = new URL(normalizeUrl(value));
    if (!url.hostname.includes(".")) throw new Error();
    return null;
  } catch {
    return "That doesn't look like a valid link.";
  }
}

export function optionalLinkedIn(value: string) {
  const bad = optionalUrl(value);
  if (bad) return bad;
  if (value && !/linkedin\.com\//i.test(value))
    return "Use your LinkedIn profile link (linkedin.com/in/…).";
  return null;
}

export function optionalPhone(value: string) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length < 7 || digits.length > 15 || /[^\d\s()+.-]/.test(value)
    ? "Enter a phone number with country code, e.g. +1 415 555 0100."
    : null;
}

/** Reads a whole, non-negative number; "" stays null. Commas are allowed. */
export function readNumber(form: FormData, key: string) {
  const raw = readString(form, key).replace(/[,\s]/g, "");
  if (!raw) return { value: null, error: null };
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0)
    return { value: null, error: "Enter a positive number." };
  return { value: n, error: null };
}

export function oneOf<T extends string>(
  value: string,
  allowed: readonly T[],
): value is T {
  return (allowed as readonly string[]).includes(value);
}

export function collect(
  entries: [field: string, error: string | null][],
): FieldErrors | null {
  const errors: FieldErrors = {};
  for (const [field, error] of entries) if (error) errors[field] = error;
  return Object.keys(errors).length ? errors : null;
}
