import type { Metadata } from "next";
import GoogleButton from "@/components/auth/GoogleButton";
import LoginForm from "@/components/auth/LoginForm";
import Eyebrow from "@/components/ui/Eyebrow";
import { LocalLink as Link } from "@/i18n/client";
import { getDictionary } from "@/i18n/server";
import { safeReturnTo } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = (await getDictionary()).auth.login;
  return { title, description, robots: { index: false, follow: false } };
}

export default async function LoginPage({ searchParams }: PageProps<"/[lang]/login">) {
  const { auth } = await getDictionary();
  const t = auth.login;
  const { error, next: nextParam } = await searchParams;
  // ?error=… from Google sign-in (app/api/auth/callback/google); only the codes we know.
  const notice =
    typeof error === "string" && Object.hasOwn(t.googleErrors, error)
      ? t.googleErrors[error as keyof typeof t.googleErrors]
      : undefined;
  // Where to go once signed in (e.g. the page an email linked to); only paths inside the site.
  const next = safeReturnTo(nextParam) ?? undefined;

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
        <GoogleButton label={t.google} pendingLabel={auth.googlePending} next={next} />
      </div>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="type-wide text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          {auth.orWithEmail}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <LoginForm t={{ ...auth.fields, ...t.form }} notice={notice} next={next} />

      <p className="mt-8 text-center text-[14px] text-muted">
        {t.newHere}{" "}
        <Link
          href="/register"
          className="font-semibold text-brand-strong transition-colors duration-200 hover:text-ink"
        >
          {t.createAccount}
        </Link>
      </p>
    </>
  );
}
