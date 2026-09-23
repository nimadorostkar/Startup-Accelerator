import { useId } from "react";
import type { CountryCode } from "./data";

const LABEL: Record<CountryCode, string> = {
  fr: "France",
  ng: "Nigeria",
  id: "Indonesia",
  br: "Brazil",
};

function Art({ code }: { code: CountryCode }) {
  switch (code) {
    case "fr":
      return (
        <>
          <rect width="8" height="24" fill="#002654" />
          <rect x="8" width="8" height="24" fill="#fff" />
          <rect x="16" width="8" height="24" fill="#ce1126" />
        </>
      );
    case "ng":
      return (
        <>
          <rect width="8" height="24" fill="#008751" />
          <rect x="8" width="8" height="24" fill="#fff" />
          <rect x="16" width="8" height="24" fill="#008751" />
        </>
      );
    case "id":
      return (
        <>
          <rect width="24" height="12" fill="#e70011" />
          <rect y="12" width="24" height="12" fill="#fff" />
        </>
      );
    case "br":
      return (
        <>
          <rect width="24" height="24" fill="#009c3b" />
          <path d="M12 3.5 22 12 12 20.5 2 12Z" fill="#ffdf00" />
          <circle cx="12" cy="12" r="4.6" fill="#002776" />
        </>
      );
  }
}

/** Small circular country flag, used as an avatar badge. */
export default function Flag({
  code,
  className = "",
}: {
  code: CountryCode;
  className?: string;
}) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" className={className} role="img">
      <title>{LABEL[code]}</title>
      <clipPath id={id}>
        <circle cx="12" cy="12" r="12" />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <Art code={code} />
      </g>
      <circle
        cx="12"
        cy="12"
        r="11.5"
        fill="none"
        stroke="rgba(15,26,35,0.18)"
      />
    </svg>
  );
}
