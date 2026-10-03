/* Shown after a save that failed because the session ended. Opens sign-in in a
   new tab, so whatever is typed into the form here survives: sign in there,
   come back, and save again. */
export default function SignInAgain({
  href,
  label = "Sign in again (new tab)",
}: {
  href?: string;
  label?: string;
}) {
  if (!href) return null;
  return (
    <>
      {" "}
      <a href={href} target="_blank" rel="noopener" className="font-semibold whitespace-nowrap underline">
        {label}
      </a>
    </>
  );
}
