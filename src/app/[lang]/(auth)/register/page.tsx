import type { Metadata } from "next";
import GoogleButton from "@/components/auth/GoogleButton";
import RegisterForm from "@/components/auth/RegisterForm";
import Eyebrow from "@/components/ui/Eyebrow";
import { LocalLink as Link } from "@/i18n/client";
import { getDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = (await getDictionary()).auth.register;
  return { title, description, robots: { index: false, follow: false } };
}

export default async function RegisterPage() {
  const { auth } = await getDictionary();
  const t = auth.register;

  return (
    <>
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="mt-4 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.02em] text-ink sm:text-[36px]">
        {t.headingStart}
        <br />
        <span className="text-brand-strong">{t.headingAccent}</span>
      </h1>
      <p className="lead mt-3">{t.lead}</p>

      <div className="mt-8">
        <GoogleButton label={t.google} pendingLabel={auth.googlePending} />
      </div>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="type-wide text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          {auth.orWithEmail}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <RegisterForm t={{ ...auth.fields, ...t.form }} />

      <p className="mt-8 text-center text-[14px] text-muted">
        {t.haveAccount}{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-strong transition-colors duration-200 hover:text-ink"
        >
          {t.signIn}
        </Link>
      </p>
    </>
  );
}
