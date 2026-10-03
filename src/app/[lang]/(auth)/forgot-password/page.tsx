import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import Eyebrow from "@/components/ui/Eyebrow";
import { LocalLink as Link } from "@/i18n/client";
import { getDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = (await getDictionary()).auth.forgot;
  return { title, description, robots: { index: false, follow: false } };
}

export default async function ForgotPasswordPage({
  searchParams,
}: PageProps<"/[lang]/forgot-password">) {
  const { auth } = await getDictionary();
  const t = auth.forgot;
  /* Prefilled when you arrive from the sign-in form with an address typed in. */
  const { email } = await searchParams;

  return (
    <>
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="mt-4 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.02em] text-ink sm:text-[36px]">
        {t.headingStart}
        <br />
        <span className="text-brand-strong">{t.headingAccent}</span>
      </h1>
      <ForgotPasswordForm
        t={{ email: auth.fields.email, emailPlaceholder: auth.fields.emailPlaceholder, ...t.form }}
        defaultEmail={typeof email === "string" ? email : ""}
      />

      <p className="mt-8 text-center text-[14px] text-muted">
        {t.remembered}{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-strong transition-colors duration-200 hover:text-ink"
        >
          {t.backToSignIn}
        </Link>
      </p>
    </>
  );
}
