import type { Metadata } from "next";
import { NameForm, PasswordForm } from "@/components/dashboard/AccountForms";
import { PageHeader } from "@/components/dashboard/ui";
import { requireUser } from "@/lib/application/dal";

export const metadata: Metadata = { title: "Account settings" };

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Account settings"
        description={`Signed in as ${user.email}.`}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <NameForm name={user.name} />
        <PasswordForm hasPassword={user.hasPassword} />
      </div>
    </>
  );
}
