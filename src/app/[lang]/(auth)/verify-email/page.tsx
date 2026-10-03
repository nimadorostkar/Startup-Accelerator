import type { Metadata } from "next";
import { redirect } from "next/navigation";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import VerifyEmailNotice from "@/components/dashboard/VerifyEmailNotice";
import Eyebrow from "@/components/ui/Eyebrow";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Confirm your email — Fundup Club",
  description: "Confirm the email address on your Fundup Club account.",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/[lang]/verify-email">) {
  const { token } = await searchParams;
  const hasToken = typeof token === "string" && token !== "";
  // Opened without the emailed link (e.g. sent here to confirm before using the review panel).
  const user = hasToken ? null : await getCurrentUser();
  if (user?.emailVerified) redirect(user.isReviewer ? "/admin" : "/dashboard");

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
      {hasToken ? (
        <VerifyEmailForm token={token} />
      ) : user ? (
        <div className="mt-8">
          <VerifyEmailNotice email={user.email} />
          {user.role === "reviewer" && (
            <p className="text-[14px] text-muted">The review panel opens once your address is confirmed.</p>
          )}
        </div>
      ) : (
        <p className="mt-8 text-[14px] text-muted">
          Open the link in the email we sent you to confirm your address.
        </p>
      )}
    </>
  );
}
