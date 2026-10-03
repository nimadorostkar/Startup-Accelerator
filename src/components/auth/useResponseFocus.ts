import { useEffect, useRef, type RefObject } from "react";

/* After a form's action answers, moves keyboard focus to the news, so a
   screen reader reads it and the next Tab carries on from there:
   - `heading`: the heading of whatever replaced the form (sent, registered,
     closed), when it's on the page;
   - otherwise the form's first invalid field (its error is read with it);
   - otherwise the alert, when it has a message (see FormAlert).
   The state before the first submit is left alone. Each answer must be a new
   object, as useActionState's are. */
export function useResponseFocus(
  state: unknown,
  {
    heading,
    form,
    alert,
  }: {
    heading?: RefObject<HTMLElement | null>;
    form?: RefObject<HTMLElement | null>;
    alert?: RefObject<HTMLElement | null>;
  },
) {
  const initial = useRef(state);
  useEffect(() => {
    if (state === initial.current) return;
    const target =
      heading?.current ??
      form?.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      (alert?.current?.textContent ? alert.current : null);
    target?.focus();
  }, [state, heading, form, alert]);
}
