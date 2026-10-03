import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import Eyebrow from "@/components/ui/Eyebrow";
import { LocalLink as Link } from "@/i18n/client";
import { getDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = (await getDictionary()).auth.reset;
  return { title, description, robots: { index: false, follow: false } };
}

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/[lang]/reset-password">) {
  const { auth } = await getDictionary();
  const t = auth.reset;
  const { token } = await searchParams;

  return (
    <>
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="mt-4 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.02em] text-ink sm:text-[36px]">
        {t.headingStart}
        <br />
        <span className="text-brand-strong">{t.headingAccent}</span>
      </h1>
      <p className="lead mt-3">{t.lead}</p>
      <ResetPasswordForm
        t={{ showPassword: auth.fields.showPassword, hidePassword: auth.fields.hidePassword, ...t.form }}
        token={typeof token === "string" ? token : ""}
      />

      <p className="mt-8 text-center text-[14px] text-muted">
        {t.expired}{" "}
        <Link
          href="/forgot-password"
          className="font-semibold text-brand-strong transition-colors duration-200 hover:text-ink"
        >
          {t.requestNew}
        </Link>
      </p>
    </>
  );
}
