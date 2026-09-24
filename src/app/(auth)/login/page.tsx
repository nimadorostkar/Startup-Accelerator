import type { Metadata } from "next";
import Link from "next/link";
import GoogleButton from "@/components/auth/GoogleButton";
import LoginForm from "@/components/auth/LoginForm";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Sign in — VC Summit",
  description: "Sign in to your VC Summit founder account.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <>
      <Eyebrow>Welcome back</Eyebrow>
      <h1 className="mt-4 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.02em] text-ink sm:text-[36px]">
        Sign in to your
        <br />
        <span className="text-gold-deep">founder account</span>
      </h1>
      <p className="lead mt-3">
        Track your application, book mentor sessions and get ready for Demo Day.
      </p>

      <div className="mt-8">
        <GoogleButton label="Continue with Google" />
      </div>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="type-wide text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          or with email
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <LoginForm />

      <p className="mt-8 text-center text-[14px] text-muted">
        New to VC Summit?{" "}
        <Link
          href="/register"
          className="font-semibold text-gold-deep transition-colors duration-200 hover:text-ink"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
