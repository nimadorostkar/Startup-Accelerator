"use client";

import { saveStartup } from "@/app/dashboard/actions";
import { requiredFields } from "@/lib/application/progress";
import { BUSINESS_MODELS, INDUSTRIES, STAGES, type Startup } from "@/lib/application/types";
import { ChoiceCards, FormSection, SelectField, TextArea, TextField } from "./fields";
import SectionForm from "./section-form";

const REQUIRED = requiredFields("startup");

export default function StartupForm({ startup, editable }: { startup: Startup; editable: boolean }) {
  return (
    <SectionForm action={saveStartup} editable={editable}>
      {({ v, err }) => {
        const common = (name: keyof Startup) => ({
          name,
          required: REQUIRED.has(name),
          error: err(name),
        });
        return (
          <>
            <FormSection id="basics" title="The basics">
              <TextField {...common("name")} label="Startup name" placeholder="Northvale" defaultValue={v("name", startup.name)} />
              <TextField {...common("website")} label="Website" inputMode="url" placeholder="northvale.com" defaultValue={v("website", startup.website)} />
              <TextField
                {...common("tagline")}
                label="One-line pitch"
                maxLength={120}
                className="sm:col-span-2"
                placeholder="Spreadsheet-simple inventory planning for independent retailers"
                hint="What you do, for whom — in under 120 characters."
                defaultValue={v("tagline", startup.tagline)}
              />
              <SelectField {...common("industry")} label="Industry" options={INDUSTRIES} defaultValue={v("industry", startup.industry)} />
              <SelectField {...common("businessModel")} label="Business model" options={BUSINESS_MODELS} defaultValue={v("businessModel", startup.businessModel)} />
              <TextField {...common("country")} label="Headquarters (country)" placeholder="Germany" defaultValue={v("country", startup.country)} />
              <TextField
                {...common("foundedOn")}
                label="Founded"
                type="month"
                hint="Month and year. Future dates are rejected on save."
                defaultValue={v("foundedOn", startup.foundedOn)}
              />
              <ChoiceCards
                {...common("incorporated")}
                label="Is the company incorporated?"
                options={[
                  { id: "yes", label: "Yes" },
                  { id: "no", label: "Not yet" },
                ]}
                columns="grid-cols-2"
                className="sm:col-span-2"
                defaultValue={v("incorporated", startup.incorporated)}
              />
            </FormSection>

            <FormSection
              id="stage"
              title="Current stage"
              description="Where are you today? This decides which track of the programme you're reviewed for."
            >
              <ChoiceCards
                {...common("stage")}
                label="Pick the stage that fits best"
                options={STAGES}
                columns="sm:grid-cols-2 lg:grid-cols-3"
                className="sm:col-span-2"
                defaultValue={v("stage", startup.stage)}
              />
            </FormSection>

            <FormSection id="idea" title="The idea" description="Be specific. Reviewers validate the problem before anything else.">
              <TextArea
                {...common("problem")}
                label="What problem are you solving?"
                min={80}
                max={1500}
                className="sm:col-span-2"
                placeholder="Who has this problem, how often, and what it costs them today."
                defaultValue={v("problem", startup.problem)}
              />
              <TextArea
                {...common("solution")}
                label="How do you solve it?"
                min={80}
                max={1500}
                className="sm:col-span-2"
                placeholder="What the product does, and why it works better than the alternatives."
                defaultValue={v("solution", startup.solution)}
              />
              <TextArea
                {...common("targetCustomer")}
                label="Who is your target customer?"
                max={600}
                rows={3}
                placeholder="Independent retailers with 1–10 stores in the EU"
                defaultValue={v("targetCustomer", startup.targetCustomer)}
              />
              <TextArea
                {...common("marketSize")}
                label="How big is the market?"
                max={600}
                rows={3}
                placeholder="How you estimate it — bottom-up beats a quoted TAM."
                defaultValue={v("marketSize", startup.marketSize)}
              />
              <TextArea
                {...common("competitors")}
                label="Who are your competitors?"
                max={1000}
                rows={3}
                placeholder="Direct competitors, and what customers use instead today."
                defaultValue={v("competitors", startup.competitors)}
              />
              <TextArea
                {...common("advantage")}
                label="What's your unfair advantage?"
                min={40}
                max={1000}
                rows={3}
                placeholder="Insight, access, technology or distribution others don't have."
                defaultValue={v("advantage", startup.advantage)}
              />
            </FormSection>

            <FormSection id="traction" title="Traction" description="Leave blank anything that doesn't apply yet — early is fine.">
              <TextField {...common("activeUsers")} label="Active users" inputMode="numeric" placeholder="1,200" defaultValue={v("activeUsers", startup.activeUsers)} />
              <TextField {...common("payingCustomers")} label="Paying customers" inputMode="numeric" placeholder="40" defaultValue={v("payingCustomers", startup.payingCustomers)} />
              <TextField
                {...common("monthlyRevenue")}
                label="Monthly revenue (USD)"
                inputMode="numeric"
                prefix="$"
                placeholder="8,500"
                defaultValue={v("monthlyRevenue", startup.monthlyRevenue)}
              />
              <TextField
                {...common("growthRate")}
                label="Monthly growth"
                inputMode="decimal"
                suffix="%"
                placeholder="15"
                defaultValue={v("growthRate", startup.growthRate)}
              />
              <TextField
                {...common("keyMetric")}
                label="Your most important metric"
                className="sm:col-span-2"
                placeholder="Weekly active stores, up from 12 to 70 since March"
                defaultValue={v("keyMetric", startup.keyMetric)}
              />
            </FormSection>

            <FormSection id="funding" title="Funding">
              <TextField
                {...common("raisedToDate")}
                label="Raised to date (USD)"
                inputMode="numeric"
                prefix="$"
                placeholder="0"
                defaultValue={v("raisedToDate", startup.raisedToDate)}
              />
              <TextField
                {...common("seeking")}
                label="Currently raising (USD)"
                inputMode="numeric"
                prefix="$"
                placeholder="750,000"
                defaultValue={v("seeking", startup.seeking)}
              />
              <TextArea
                {...common("useOfFunds")}
                label="How will you use the money?"
                max={1000}
                rows={3}
                className="sm:col-span-2"
                defaultValue={v("useOfFunds", startup.useOfFunds)}
              />
            </FormSection>

            <FormSection id="materials" title="Materials" description="Share links with view access for anyone who has the link.">
              <TextField
                {...common("deckUrl")}
                label="Pitch deck"
                inputMode="url"
                className="sm:col-span-2"
                placeholder="docsend.com/view/… or a Google Drive link"
                defaultValue={v("deckUrl", startup.deckUrl)}
              />
              <TextField {...common("demoUrl")} label="Product or demo" inputMode="url" placeholder="app.northvale.com" defaultValue={v("demoUrl", startup.demoUrl)} />
              <TextField
                {...common("videoUrl")}
                label="Founder video (1–2 min)"
                inputMode="url"
                placeholder="loom.com/share/…"
                defaultValue={v("videoUrl", startup.videoUrl)}
              />
            </FormSection>
          </>
        );
      }}
    </SectionForm>
  );
}
