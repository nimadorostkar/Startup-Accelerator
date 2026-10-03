import { Fragment, type ReactNode } from "react";

/* Translated sentences with markup inside them (shared by every part of the site). The dictionaries hold plain
   strings, so a sentence with a link or a bold address in it keeps a
   {placeholder} where that goes ("Joining details go to {email} before the
   event."), and a heading's line breaks are "\n". Each language can then put
   the pieces where its own word order wants them. */

/** "Hello {name}" + { name: <b>Ada</b> } → ["Hello ", <b>Ada</b>]; "\n" becomes <br />. */
export function rich(template: string, parts: Record<string, ReactNode> = {}): ReactNode {
  return template.split("\n").map((line, l) => (
    <Fragment key={l}>
      {l > 0 && <br />}
      {line.split(/(\{\w+\})/).map((piece, i) => {
        const key = /^\{(\w+)\}$/.exec(piece)?.[1];
        return <Fragment key={i}>{key && key in parts ? parts[key] : piece}</Fragment>;
      })}
    </Fragment>
  ));
}
