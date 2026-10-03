import { notFound } from "next/navigation";

/* Any address the public site doesn't have: the 404 page, in the visitor's language. */
export default function UnknownPage() {
  notFound();
}
