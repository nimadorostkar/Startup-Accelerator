import type { Metadata } from "next";
import Link from "next/link";
import GoogleButton from "@/components/auth/GoogleButton";
import RegisterForm from "@/components/auth/RegisterForm";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Create your account — VC Summit",
  description:
    "Create a VC Summit account to apply to the accelerator and join the founder network.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <>
      <Eyebrow>Applications open</Eyebrow>
      <h1 className="mt-4 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.02em] text-ink sm:text-[36px]">
        Create your
        <br />
        <span className="text-gold-deep">founder account</span>
      </h1>
      <p className="lead mt-3">
        One account for your application, the cohort programme and Demo Day.
      </p>

      <div className="mt-8">
        <GoogleButton label="Sign up with Google" />
      </div>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="type-wide text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          or with email
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <RegisterForm />

      <p className="mt-8 text-center text-[14px] text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-gold-deep transition-colors duration-200 hover:text-ink"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
