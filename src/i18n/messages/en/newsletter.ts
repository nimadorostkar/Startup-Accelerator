/* The Founder Brief: the newsletter page, an issue's page, the sign-up form
   and the unsubscribe page. Issues themselves come from the API and are
   shown as written. "{name}" placeholders are filled with format() or rich();
   "\n" in a heading is a line break. */
const newsletter = {
  /** Display names of the topics (the API's values are the keys). */
  categories: {
    Fundraising: "Fundraising",
    Building: "Building",
    AI: "AI",
    "Founder Stories": "Founder Stories",
    "Program News": "Program News",
  },
  minRead: "{count} min read",
  issue: "Issue Nº{issue}",
  page: {
    metaTitle: "Newsletter — The Founder Brief · Fundup Club",
    metaDescription:
      "Fundraising playbooks, AI build guides and founder stories from the Fundup Club network. Every other Thursday, free.",
    eyebrow: "The Founder Brief · Newsletter",
    heading: "Build notes\nfor {accent}\nfounders",
    headingAccent: "ambitious",
    lead: "Fundraising playbooks, AI build guides and founder stories from the Fundup Club network, straight to your inbox.",
    perks: ["Every other Thursday", "A 5-minute read", "Free, always"],
    inboxTo: "to you · Issue Nº{issue}",
    inboxNew: "New",
    readThis: "Read this issue",
    featured: "Featured",
    by: "By {author}",
    readIssue: "Read the issue",
    archiveEyebrow: "From the archive",
    latest: "Latest {accent}",
    latestAccent: "issues",
    filterLabel: "Filter by topic",
    allTopics: "All topics",
    noun: { one: "article", other: "articles" },
    emptyTopic: "No articles in this topic yet.",
    bandEyebrow: "Never miss an issue",
    bandHeading: "The playbooks our founders use, in your inbox.",
  },
  article: {
    metaTitle: "{title} — The Founder Brief",
    allIssues: "All issues",
    subscribeHeading: "Enjoyed this issue?",
    subscribeLead: "Get The Founder Brief every other Thursday. Free, and a 5-minute read.",
    more: "More from {accent}",
    moreAccent: "the Brief",
  },
  subscribe: {
    label: "Email address",
    placeholder: "you@company.com",
    submit: "Subscribe",
    pending: "Subscribing…",
    doneNew: "You’re in. The next issue goes to {email}.",
    doneExisting: "{email} is already on the list.",
    failed: "We couldn't sign you up just now. Please try again.",
  },
  unsubscribe: {
    metaTitle: "Unsubscribe — The Founder Brief · Fundup Club",
    eyebrow: "The Founder Brief",
    heading: "Unsubscribe from the newsletter",
    lead: "You’ll stop getting the issue every other Thursday. Emails about an application or an event you registered for still arrive.",
    incomplete: "This unsubscribe link is incomplete. Use the link in your latest email again, or {link}.",
    incompleteLink: "go to the newsletter page",
    done: "You’re unsubscribed",
    doneLead: "{email} won’t get The Founder Brief any more.",
    changedMind: "Changed your mind? You can {link} at any time.",
    signUpAgain: "sign up again",
    submit: "Unsubscribe",
    pending: "Unsubscribing…",
    failed: "That link didn't work.",
  },
};

export default newsletter;
