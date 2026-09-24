import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Reset your password — VC Summit",
  description: "Get a link to set a new password for your VC Summit account.",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({
  searchParams,
}: PageProps<"/forgot-password">) {
  /* Prefilled when you arrive from the sign-in form with an address typed in. */
  const { email } = await searchParams;

  return (
    <>
      <Eyebrow>Account recovery</Eyebrow>
      <h1 className="mt-4 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.02em] text-ink sm:text-[36px]">
        Reset your
        <br />
        <span className="text-gold-deep">password</span>
      </h1>
      <ForgotPasswordForm defaultEmail={typeof email === "string" ? email : ""} />

      <p className="mt-8 text-center text-[14px] text-muted">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-semibold text-gold-deep transition-colors duration-200 hover:text-ink"
        >
          Back to sign in
        </Link>
      </p>
    </>
  );
}
