import type { Metadata } from "next";
import TeamDetailsForm from "@/components/dashboard/TeamDetailsForm";
import TeamManager from "@/components/dashboard/TeamManager";
import { FeedbackNotice, LockedNotice, NextStep, PageHeader } from "@/components/dashboard/ui";
import { canEdit, getMyApplication } from "@/lib/application/dal";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const app = await getMyApplication();
  const editable = canEdit(app);

  return (
    <>
      <PageHeader
        eyebrow="Step 3 of 3"
        title="Your team"
        description="Who's building this, how the equity is split, and why you're the team to do it."
      />
      <FeedbackNotice app={app} compact />
      {!editable && <LockedNotice status={app.status} />}

      <div className="flex flex-col gap-5">
        <TeamManager members={app.team.members} editable={editable} />
        <TeamDetailsForm team={app.team} editable={editable} />
      </div>
      <NextStep href="/dashboard/review" label="Next: review & submit" />
    </>
  );
}
