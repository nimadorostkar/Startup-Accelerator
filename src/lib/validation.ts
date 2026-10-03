/* Field checks for the sign-in and public forms (auth, contact, events,
   newsletter), so obvious mistakes are caught before a call to the API.
   The API checks everything again, in the same words, along with every
   dashboard field: backend/apps/core/validation.py and
   backend/apps/applications/rules.py.

   Every checker returns an error message, or null when the value is fine. */

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

export function maxLength(value: string, max: number) {
  return value.length > max ? `Keep this under ${max} characters.` : null;
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
