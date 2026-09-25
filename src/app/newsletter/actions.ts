"use server";

import { addSubscriber } from "@/lib/newsletter";
import { checkEmail, readString } from "@/lib/validation";

export type SubscribeState = {
  error?: string;
  email?: string;
  /** "new" on first sign-up, "existing" if the address was already on the list. */
  done?: "new" | "existing";
};

export async function subscribe(
  _prev: SubscribeState,
  form: FormData,
): Promise<SubscribeState> {
  const email = readString(form, "email");

  // Honeypot: hidden from people, filled in by most bots. Pretend it worked.
  if (readString(form, "website")) return { done: "new", email };

  const error = checkEmail(email);
  if (error) return { error, email };

  const source = readString(form, "source").slice(0, 80) || "newsletter";
  try {
    const added = await addSubscriber(email, source);
    return { done: added ? "new" : "existing", email };
  } catch {
    return {
      error: "We couldn't sign you up just now. Please try again.",
      email,
    };
  }
}
