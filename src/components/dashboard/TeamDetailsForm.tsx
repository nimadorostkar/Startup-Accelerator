"use client";

import { saveTeamDetails } from "@/app/dashboard/actions";
import { requiredFields } from "@/lib/application/progress";
import { WORKED_TOGETHER, type Team } from "@/lib/application/types";
import { FormSection, SelectField, TextArea } from "./fields";
import SectionForm from "./section-form";

const REQUIRED = requiredFields("team");

export default function TeamDetailsForm({ team, editable }: { team: Team; editable: boolean }) {
  return (
    <SectionForm action={saveTeamDetails} editable={editable}>
      {({ v, err }) => (
        <FormSection title="About the team" description="Reviewers back teams as much as ideas.">
          <SelectField
            name="workedTogether"
            label="How long have the founders worked together?"
            required={REQUIRED.has("workedTogether")}
            options={WORKED_TOGETHER}
            className="sm:col-span-2"
            defaultValue={v("workedTogether", team.workedTogether)}
            error={err("workedTogether")}
          />
          <TextArea
            name="whyUs"
            label="Why is this the right team for this problem?"
            required={REQUIRED.has("whyUs")}
            min={60}
            max={1200}
            rows={5}
            className="sm:col-span-2"
            placeholder="Relevant experience, how you met, what each founder owns."
            defaultValue={v("whyUs", team.whyUs)}
            error={err("whyUs")}
          />
          <TextArea
            name="hiringNeeds"
            label="Who do you need to hire next?"
            max={800}
            rows={3}
            className="sm:col-span-2"
            placeholder="The roles you're missing, and when you need them."
            defaultValue={v("hiringNeeds", team.hiringNeeds)}
            error={err("hiringNeeds")}
          />
        </FormSection>
      )}
    </SectionForm>
  );
}
