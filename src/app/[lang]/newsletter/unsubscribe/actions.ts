"use server";

import { BackendUnavailable, UNAVAILABLE } from "@/lib/api";
import { unsubscribe } from "@/lib/newsletter";
import { readString } from "@/lib/validation";

export type UnsubscribeState = { email?: string; message?: string };

export async function leaveNewsletter(_prev: UnsubscribeState, form: FormData): Promise<UnsubscribeState> {
  try {
    const result = await unsubscribe(readString(form, "token"));
    return result.ok ? { email: result.email } : { message: result.message };
  } catch (err) {
    if (err instanceof BackendUnavailable) return { message: UNAVAILABLE };
    throw err;
  }
}
