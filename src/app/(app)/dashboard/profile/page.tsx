import type { Metadata } from "next";
import ImageUpload from "@/components/dashboard/ImageUpload";
import ProfileForm from "@/components/dashboard/ProfileForm";
import { FeedbackNotice, LockedNotice, NextStep, PageHeader } from "@/components/dashboard/ui";
import { canEdit, getMyApplication } from "@/lib/application/dal";

export const metadata: Metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const app = await getMyApplication();
  const editable = canEdit(app);

  return (
    <>
      <PageHeader
        eyebrow="Step 1 of 3"
        title="Your profile"
        description="Tell us about the person applying. Fields marked * are needed before you can submit."
      />
      <FeedbackNotice app={app} compact />
      {!editable && <LockedNotice status={app.status} />}
      <ImageUpload kind="photo" current={app.photo} name={app.profile.fullName} editable={editable} />
      <ProfileForm profile={app.profile} editable={editable} />
      <NextStep href="/dashboard/startup" label="Next: startup details" />
    </>
  );
}
