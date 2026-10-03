import { purge } from "./global-setup";

/* Removes the accounts, applications, registrations, subscribers and messages the run created. */
export default function globalTeardown() {
  purge();
}
