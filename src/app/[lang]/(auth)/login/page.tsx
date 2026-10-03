import type { Metadata } from "next";
import Link from "next/link";
import GoogleButton from "@/components/auth/GoogleButton";
import LoginForm from "@/components/auth/LoginForm";
import Eyebrow from "@/components/ui/Eyebrow";
import { safeReturnTo } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in — Fundup Club",
  description: "Sign in to your Fundup Club founder account.",
  robots: { index: false, follow: false },
};

/* Where Google sign-in sends people back when it didn't work (app/api/auth/callback/google). */
const GOOGLE_ERRORS: Record<string, string> = {
  google_cancelled: "Google sign-in was cancelled. Try again, or sign in with your email.",
  google_state: "That Google sign-in took too long or didn't start here. Please try again.",
  google: "Google sign-in didn't work this time. Please try again, or sign in with your email.",
  google_unverified: "Your Google account needs a verified email address. Verify it with Google, or sign in with your email.",
  google_disabled: "This account has been deactivated. Contact us if you think that's a mistake.",
  google_busy: "Too many sign-in attempts. Please wait a few minutes and try again.",
  google_unavailable: "Google sign-in isn't available right now. Please sign in with your email, or try again later.",
};

export default async function LoginPage({ searchParams }: PageProps<"/[lang]/login">) {
  const { error, next: nextParam } = await searchParams;
  const notice = typeof error === "string" ? GOOGLE_ERRORS[error] : undefined;
  // Where to go once signed in (e.g. the page an email linked to); only paths inside the site.
  const next = safeReturnTo(nextParam) ?? undefined;

  return (
    <>
      <Eyebrow>Welcome back</Eyebrow>
      <h1 className="mt-4 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.02em] text-ink sm:text-[36px]">
        Sign in to your
        <br />
        <span className="text-brand-strong">founder account</span>
      </h1>
      <p className="lead mt-3">
        Track your application, book mentor sessions and get ready for Demo Day.
      </p>

      <div className="mt-8">
        <GoogleButton label="Continue with Google" next={next} />
      </div>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="type-wide text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          or with email
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <LoginForm notice={notice} next={next} />

      <p className="mt-8 text-center text-[14px] text-muted">
        New to Fundup Club?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand-strong transition-colors duration-200 hover:text-ink"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
