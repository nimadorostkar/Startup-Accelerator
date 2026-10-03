import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Choose a new password — Fundup Club",
  description: "Set a new password for your Fundup Club account.",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/[lang]/reset-password">) {
  const { token } = await searchParams;

  return (
    <>
      <Eyebrow>Account recovery</Eyebrow>
      <h1 className="mt-4 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.02em] text-ink sm:text-[36px]">
        Choose a new
        <br />
        <span className="text-brand-strong">password</span>
      </h1>
      <p className="lead mt-3">
        Pick something you don&rsquo;t use anywhere else. You&rsquo;ll be signed
        in straight away, and signed out on your other devices.
      </p>
      <ResetPasswordForm token={typeof token === "string" ? token : ""} />

      <p className="mt-8 text-center text-[14px] text-muted">
        Link expired?{" "}
        <Link
          href="/forgot-password"
          className="font-semibold text-brand-strong transition-colors duration-200 hover:text-ink"
        >
          Request a new one
        </Link>
      </p>
    </>
  );
}
