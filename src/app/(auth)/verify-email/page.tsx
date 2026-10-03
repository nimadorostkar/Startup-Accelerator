import type { Metadata } from "next";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Confirm your email — Fundup Club",
  description: "Confirm the email address on your Fundup Club account.",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/verify-email">) {
  const { token } = await searchParams;

  return (
    <>
      <Eyebrow>One last step</Eyebrow>
      <h1 className="mt-4 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.02em] text-ink sm:text-[36px]">
        Confirm your
        <br />
        <span className="text-brand-strong">email address</span>
      </h1>
      <p className="lead mt-3">
        So we know where to reach you about your application and Demo Day.
      </p>
      <VerifyEmailForm token={typeof token === "string" ? token : ""} />
    </>
  );
}
