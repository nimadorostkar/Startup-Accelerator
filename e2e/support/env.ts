/* Where the stack under test lives. Defaults match the dev stack
   (docker-compose.dev.yml + `npm run dev`); override with E2E_* variables to
   point the suite at another environment. Reads the project's .env, like the
   website does, so a moved API port (BACKEND_URL) is picked up. */

try {
  process.loadEnvFile(".env");
} catch {
  // no .env: defaults below
}

const trim = (url: string) => url.replace(/\/+$/, "");

/** The website (Next.js). */
export const SITE = trim(process.env.E2E_SITE_URL ?? "http://localhost:3000");
/** The API, called directly over HTTP. */
export const API = trim(process.env.E2E_API_URL ?? `${trim(process.env.BACKEND_URL ?? "http://localhost:8000")}/api/v1`);
/** Mailpit, which catches every email the stack sends. */
export const MAILPIT = trim(process.env.E2E_MAILPIT_URL ?? `http://localhost:${process.env.DEV_MAIL_PORT ?? "8025"}`);

/** A verified reviewer (created by `python manage.py seed_dev_accounts`). */
export const REVIEWER = {
  email: process.env.E2E_REVIEWER_EMAIL ?? "reviewer@example.com",
  password: process.env.E2E_REVIEWER_PASSWORD ?? "fundup-dev-2026",
};
/** A back-office superuser (same command). */
export const ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? "admin@example.com",
  password: process.env.E2E_ADMIN_PASSWORD ?? "fundup-dev-2026",
};

/** Every address the suite creates ends with this, so `purge_e2e_data` can remove them. */
export const EMAIL_DOMAIN = "e2e.fundup.example";
