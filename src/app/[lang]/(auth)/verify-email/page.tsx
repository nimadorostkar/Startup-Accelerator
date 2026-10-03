import type { Metadata } from "next";
import { redirect } from "next/navigation";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import VerifyEmailNotice from "@/components/dashboard/VerifyEmailNotice";
import Eyebrow from "@/components/ui/Eyebrow";
import { getDictionary } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = (await getDictionary()).auth.verify;
  return { title, description, robots: { index: false, follow: false } };
}

export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/[lang]/verify-email">) {
  const t = (await getDictionary()).auth.verify;
  const { token } = await searchParams;
  const hasToken = typeof token === "string" && token !== "";
  // Opened without the emailed link (e.g. sent here to confirm before using the review panel).
  const user = hasToken ? null : await getCurrentUser();
  if (user?.emailVerified) redirect(user.isReviewer ? "/admin" : "/dashboard");

  return (
    <>
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="mt-4 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.02em] text-ink sm:text-[36px]">
        {t.headingStart}
        <br />
        <span className="text-brand-strong">{t.headingAccent}</span>
      </h1>
      <p className="lead mt-3">{t.lead}</p>
      {hasToken ? (
        <VerifyEmailForm t={t.form} token={token} />
      ) : user ? (
        <div className="mt-8">
          <VerifyEmailNotice email={user.email} t={t.notice} />
          {user.role === "reviewer" && <p className="text-[14px] text-muted">{t.reviewerNote}</p>}
        </div>
      ) : (
        <p className="mt-8 text-[14px] text-muted">{t.openLink}</p>
      )}
    </>
  );
}
