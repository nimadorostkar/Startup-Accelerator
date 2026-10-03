import Image from "next/image";
import { initials } from "../dashboard/initials";
import { monogramGradient } from "@/lib/application/directory";

/* A startup's logo, or (until it uploads one) its initials on its own gradient.
   Uploaded images are already small WebP files (the API resizes them), so they
   are shown as they are rather than through the image optimiser. */
export default function Monogram({
  name,
  logo,
  className = "h-14 w-14 rounded-[16px] text-[18px]",
}: {
  name: string;
  logo?: string;
  className?: string;
}) {
  if (logo)
    return (
      <Image
        src={logo}
        alt=""
        width={96}
        height={96}
        unoptimized
        className={`shrink-0 bg-white object-cover shadow-[0_10px_24px_-12px_rgba(20,26,34,0.5)] ${className}`}
      />
    );
  return (
    <span
      aria-hidden="true"
      style={{ background: monogramGradient(name) }}
      className={`flex shrink-0 items-center justify-center font-display font-extrabold tracking-[-0.02em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_24px_-12px_rgba(20,26,34,0.5)] ${className}`}
    >
      {initials(name)}
    </span>
  );
}

/** A person: their photo, or their initials. */
export function FounderDot({
  name,
  photo,
  className = "h-7 w-7 text-[10px]",
}: {
  name: string;
  photo?: string;
  className?: string;
}) {
  if (photo)
    return (
      <Image
        src={photo}
        alt=""
        width={96}
        height={96}
        unoptimized
        className={`shrink-0 rounded-full bg-chip object-cover ring-2 ring-white ${className}`}
      />
    );
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-chip font-display font-bold tracking-[0.02em] text-brand-strong ring-2 ring-white ${className}`}
    >
      {initials(name)}
    </span>
  );
}
