"use client";

import { saveProfile } from "@/app/dashboard/actions";
import { requiredFields } from "@/lib/application/progress";
import { COMMITMENTS, HEARD_FROM, type Profile } from "@/lib/application/types";
import { ChoiceCards, FormSection, SelectField, TextArea, TextField } from "./fields";
import SectionForm from "./section-form";

const REQUIRED = requiredFields("profile");

export default function ProfileForm({ profile, editable }: { profile: Profile; editable: boolean }) {
  return (
    <SectionForm action={saveProfile} editable={editable}>
      {({ v, err }) => {
        const common = (name: keyof Profile) => ({
          name,
          required: REQUIRED.has(name),
          error: err(name),
        });
        return (
          <>
            <FormSection title="About you" description="How the review team will know and reach you.">
              <TextField {...common("fullName")} label="Full name" autoComplete="name" defaultValue={v("fullName", profile.fullName)} />
              <TextField
                {...common("title")}
                label="Your role"
                placeholder="CEO & co-founder"
                autoComplete="organization-title"
                defaultValue={v("title", profile.title)}
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                value={profile.email}
                readOnly
                disabled
                hint="This is your sign-in address. Contact support to change it."
              />
              <TextField
                {...common("phone")}
                label="Phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+1 415 555 0100"
                defaultValue={v("phone", profile.phone)}
              />
              <TextField
                {...common("linkedin")}
                label="LinkedIn"
                inputMode="url"
                placeholder="linkedin.com/in/your-name"
                defaultValue={v("linkedin", profile.linkedin)}
              />
              <TextField
                {...common("experienceYears")}
                label="Years of work experience"
                inputMode="numeric"
                placeholder="8"
                defaultValue={v("experienceYears", profile.experienceYears)}
              />
            </FormSection>

            <FormSection title="Where you're based">
              <TextField
                {...common("country")}
                label="Country"
                autoComplete="country-name"
                placeholder="United States"
                defaultValue={v("country", profile.country)}
              />
              <TextField
                {...common("city")}
                label="City"
                autoComplete="address-level2"
                placeholder="San Francisco"
                defaultValue={v("city", profile.city)}
              />
            </FormSection>

            <FormSection title="Commitment" description="Most accepted founders work on their startup full-time.">
              <ChoiceCards
                {...common("commitment")}
                label="How much time do you give the startup?"
                options={COMMITMENTS}
                columns="grid-cols-2"
                className="sm:col-span-2"
                defaultValue={v("commitment", profile.commitment)}
              />
              <SelectField
                {...common("heardFrom")}
                label="How did you hear about us?"
                options={HEARD_FROM}
                className="sm:col-span-2"
                defaultValue={v("heardFrom", profile.heardFrom)}
              />
            </FormSection>

            <FormSection title="Your story" description="Reviewers read this first when they meet your team.">
              <TextArea
                {...common("bio")}
                label="Short bio"
                min={60}
                max={1200}
                rows={5}
                className="sm:col-span-2"
                placeholder="What you've built before, what you're known for, and why you're the person to solve this problem."
                defaultValue={v("bio", profile.bio)}
              />
            </FormSection>
          </>
        );
      }}
    </SectionForm>
  );
}
