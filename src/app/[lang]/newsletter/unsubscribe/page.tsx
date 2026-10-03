import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import UnsubscribeForm from "@/components/newsletter/UnsubscribeForm";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Unsubscribe — The Founder Brief · Fundup Club",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({ searchParams }: PageProps<"/[lang]/newsletter/unsubscribe">) {
  const { token } = await searchParams;
  // Missing, empty or given twice (?token=a&token=b): nothing to send.
  const value = typeof token === "string" ? token.trim() : "";

  return (
    <>
      <Navbar />
      <main id="main" className="bg-cream px-4 pt-[120px] pb-24 sm:px-8 lg:pt-[calc(min(5.74vw,110px)+64px)]">
        <div className="mx-auto max-w-[640px]">
          <Eyebrow>The Founder Brief</Eyebrow>
          <h1 className="mt-4 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.02em] text-ink sm:text-[40px]">
            Unsubscribe from the newsletter
          </h1>
          <p className="lead mt-3">
            You&rsquo;ll stop getting the issue every other Thursday. Emails about an application or an event you
            registered for still arrive.
          </p>
          {value ? (
            <UnsubscribeForm token={value} />
          ) : (
            <p className="mt-8 rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink-soft">
              This unsubscribe link is incomplete. Use the link in your latest email again, or{" "}
              <Link href="/newsletter" className="font-semibold text-brand-strong hover:text-ink">
                go to the newsletter page
              </Link>
              .
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
