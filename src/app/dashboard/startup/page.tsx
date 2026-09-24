import type { Metadata } from "next";
import StartupForm from "@/components/dashboard/StartupForm";
import { FeedbackNotice, LockedNotice, NextStep, PageHeader } from "@/components/dashboard/ui";
import { canEdit, getMyApplication } from "@/lib/application/dal";

export const metadata: Metadata = { title: "Startup details" };

const PARTS = [
  { id: "basics", label: "Basics" },
  { id: "stage", label: "Stage" },
  { id: "idea", label: "The idea" },
  { id: "traction", label: "Traction" },
  { id: "funding", label: "Funding" },
  { id: "materials", label: "Materials" },
];

export default async function StartupPage() {
  const app = await getMyApplication();
  const editable = canEdit(app);

  return (
    <>
      <PageHeader
        eyebrow="Step 2 of 3"
        title="Startup details"
        description="The idea, the market and where you are today. This is what our team validates and analyses."
      />
      <FeedbackNotice app={app} compact />
      {!editable && <LockedNotice status={app.status} />}

      {/* Jump links — it's a long form */}
      <nav aria-label="Form sections" className="snap-row mb-5 gap-2 [--bleed:16px] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {PARTS.map((part) => (
          <a
            key={part.id}
            href={`#${part.id}`}
            className="flex h-9 items-center rounded-full bg-white px-3.5 text-[13px] font-semibold whitespace-nowrap text-ink-soft ring-1 ring-line-soft transition-colors hover:text-gold-deep hover:ring-gold/50"
          >
            {part.label}
          </a>
        ))}
      </nav>

      <StartupForm startup={app.startup} editable={editable} />
      <NextStep href="/dashboard/team" label="Next: your team" />
    </>
  );
}
