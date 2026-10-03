/* The sign-in pages (/login, /register, /forgot-password, /reset-password,
   /verify-email) and the brand panel beside them. After signing in, people
   land on the English-only dashboard. */
const auth = {
  layout: {
    backToSite: "Back to site",
    eyebrow: "Founder access",
    headingLine1: "The room where ideas",
    headingLine2: "find their capital.",
    proof: [
      "Apply once, reach 180+ investment firms",
      "Mentors and operators from 65+ markets",
      "Demo Day, pitch reviews and warm intros",
    ],
    stats: [
      { value: "$420B+", label: "Capital represented" },
      { value: "25,000+", label: "Founders trained" },
    ],
  },
  /* Shared by the forms. */
  fields: {
    email: "Email",
    emailPlaceholder: "you@company.com",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
  orWithEmail: "or with email",
  googlePending: "Opening Google…",
  login: {
    title: "Sign in — Fundup Club",
    description: "Sign in to your Fundup Club founder account.",
    eyebrow: "Welcome back",
    headingStart: "Sign in to your",
    headingAccent: "founder account",
    lead: "Track your application, book mentor sessions and get ready for Demo Day.",
    google: "Continue with Google",
    newHere: "New to Fundup Club?",
    createAccount: "Create an account",
    form: {
      passwordPlaceholder: "Your password",
      forgot: "Forgot password?",
      remember: "Keep me signed in",
      submit: "Sign in",
      pending: "Signing in…",
    },
    /* Where Google sign-in sends people back when it didn't work (?error=…, app/api/auth/callback/google). */
    googleErrors: {
      google_cancelled: "Google sign-in was cancelled. Try again, or sign in with your email.",
      google_state: "That Google sign-in took too long or didn't start here. Please try again.",
      google: "Google sign-in didn't work this time. Please try again, or sign in with your email.",
      google_unverified:
        "Your Google account needs a verified email address. Verify it with Google, or sign in with your email.",
      google_disabled: "This account has been deactivated. Contact us if you think that's a mistake.",
      google_busy: "Too many sign-in attempts. Please wait a few minutes and try again.",
      google_unavailable:
        "Google sign-in isn't available right now. Please sign in with your email, or try again later.",
    },
  },
  register: {
    title: "Create your account — Fundup Club",
    description: "Create a Fundup Club account to apply to the accelerator and join the founder network.",
    eyebrow: "Applications open",
    headingStart: "Create your",
    headingAccent: "founder account",
    lead: "One account for your application, the cohort programme and Demo Day.",
    google: "Sign up with Google",
    haveAccount: "Already have an account?",
    signIn: "Sign in",
    form: {
      name: "Full name",
      namePlaceholder: "Ada Lovelace",
      passwordPlaceholder: "At least 8 characters",
      passwordHint: "At least 8 characters, with a letter and a number.",
      /* {terms} and {privacy} are the two links below. */
      terms: "I agree to the {terms} and {privacy}.",
      termsLink: "Terms of Use",
      privacyLink: "Privacy Policy",
      submit: "Create account",
      pending: "Creating account…",
    },
  },
  forgot: {
    title: "Reset your password — Fundup Club",
    description: "Get a link to set a new password for your Fundup Club account.",
    eyebrow: "Account recovery",
    headingStart: "Reset your",
    headingAccent: "password",
    remembered: "Remembered it?",
    backToSignIn: "Back to sign in",
    form: {
      lead: "Enter the email you signed up with and we’ll send you a link to set a new password.",
      submit: "Send reset link",
      pending: "Sending link…",
      sentHeading: "Check your inbox",
      /* {email} is the address they typed, in bold. */
      sentLead:
        "If an account exists for {email}, a password reset link is on its way. The link is single-use and expires shortly.",
      sentHint: "Nothing after a minute or two? Check your spam folder, or try a different address.",
      differentEmail: "Use a different email",
    },
  },
  reset: {
    title: "Choose a new password — Fundup Club",
    description: "Set a new password for your Fundup Club account.",
    eyebrow: "Account recovery",
    headingStart: "Choose a new",
    headingAccent: "password",
    lead: "Pick something you don’t use anywhere else. You’ll be signed in straight away, and signed out on your other devices.",
    expired: "Link expired?",
    requestNew: "Request a new one",
    form: {
      password: "New password",
      passwordPlaceholder: "At least 8 characters, with a number",
      submit: "Set new password",
      pending: "Saving…",
      newLink: "Get a new link",
    },
  },
  verify: {
    title: "Confirm your email — Fundup Club",
    description: "Confirm the email address on your Fundup Club account.",
    eyebrow: "One last step",
    headingStart: "Confirm your",
    headingAccent: "email address",
    lead: "So we know where to reach you about your application and Demo Day.",
    reviewerNote: "The review panel opens once your address is confirmed.",
    openLink: "Open the link in the email we sent you to confirm your address.",
    form: {
      submit: "Confirm my email",
      pending: "Confirming…",
      doneHeading: "Email confirmed",
      doneLead: "Thanks — we’ll use this address for everything about your application.",
      dashboard: "Go to your dashboard",
    },
    notice: {
      title: "Confirm your email.",
      sentTo: "We sent a link to {email}, so the review team can reach you.",
      resend: "Resend link",
      sending: "Sending…",
    },
  },
};

export default auth;
