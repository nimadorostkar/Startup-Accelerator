/* The contact page (/contact) and its form. Validation and API messages are
   in formMessages.ts. */
const contact = {
  metaTitle: "Contact — Fundup Club",
  metaDescription:
    "Questions about the accelerator, investing or partnerships? Send the Fundup Club team a message.",
  eyebrow: "Contact",
  titleStart: "Let’s",
  titleAccent: "talk",
  lead: "Founders, investors, mentors and press: send us a message and the right person on the team will get back to you.",
  formTitle: "Send us a message",
  formNote: "All fields are required unless marked optional.",
  shortcutsLabel: "Other ways to get help",
  shortcuts: {
    apply: {
      title: "Ready to apply?",
      body: "Applications for Silicon Valley Fall 2026 are open. Applying is free.",
      cta: "Start your application",
    },
    program: {
      title: "Program questions",
      body: "Costs, equity, agreements and which program fits you.",
      cta: "Read the FAQ",
    },
    applied: {
      title: "Already applied?",
      body: "Check your application's status and any messages from our team.",
      cta: "Sign in",
    },
  },
  /* The form (client). Topics are keyed by the English topic the API stores. */
  form: {
    name: "Full name",
    namePlaceholder: "Jane Founder",
    email: "Email",
    emailPlaceholder: "you@company.com",
    company: "Company (optional)",
    companyPlaceholder: "Your startup or firm",
    topic: "What’s this about?",
    topicPlaceholder: "Choose a topic",
    topics: {
      "Applying to the program": "Applying to the program",
      "Investing or partnerships": "Investing or partnerships",
      Mentoring: "Mentoring",
      Press: "Press",
      "Something else": "Something else",
    },
    message: "Message",
    messagePlaceholder: "How can we help?",
    send: "Send message",
    sending: "Sending…",
    sentTitle: "Message sent",
    /* {email} is shown in bold */
    sentBody: "Thanks, {name}. Our team will reply to {email}.",
    sendAnother: "Send another message",
  },
};

export default contact;
