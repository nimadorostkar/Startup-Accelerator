import type { ReactNode } from "react";

/* Line icons for the dashboard, drawn on the same 24px / 1.7 stroke grid
   as the landing page's journey icons. */
function Stroke({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

type P = { className?: string };

export const GridIcon = ({ className }: P) => (
  <Stroke className={className}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
  </Stroke>
);

export const UserIcon = ({ className }: P) => (
  <Stroke className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5v-.8A5.7 5.7 0 0 1 10.2 14h3.6a5.7 5.7 0 0 1 5.7 5.7v.8" />
  </Stroke>
);

export const RocketIcon = ({ className }: P) => (
  <Stroke className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </Stroke>
);

export const TeamIcon = ({ className }: P) => (
  <Stroke className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Stroke>
);

export const ClipboardIcon = ({ className }: P) => (
  <Stroke className={className}>
    <rect x="5" y="4" width="14" height="17" rx="2.2" />
    <path d="M9 4.5V3.8A1.3 1.3 0 0 1 10.3 2.5h3.4A1.3 1.3 0 0 1 15 3.8v.7" />
    <path d="m9 13 2.2 2.2L15.5 11" />
  </Stroke>
);

export const LogOutIcon = ({ className }: P) => (
  <Stroke className={className}>
    <path d="M14 4h3.5A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5H14" />
    <path d="M10 16.5 5.5 12 10 7.5" />
    <path d="M5.5 12H15" />
  </Stroke>
);

export const LockIcon = ({ className }: P) => (
  <Stroke className={className}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
    <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
  </Stroke>
);

export const ClockIcon = ({ className }: P) => (
  <Stroke className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Stroke>
);

export const ChatIcon = ({ className }: P) => (
  <Stroke className={className}>
    <path d="M20 12.5a7.5 7.5 0 0 1-11.1 6.6L4 20.5l1.4-4.6A7.5 7.5 0 1 1 20 12.5Z" />
  </Stroke>
);

export const ExternalIcon = ({ className }: P) => (
  <Stroke className={className}>
    <path d="M14 4h6v6" />
    <path d="M20 4 11 13" />
    <path d="M18 14.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5" />
  </Stroke>
);

export const NAV_ICONS = {
  overview: GridIcon,
  profile: UserIcon,
  startup: RocketIcon,
  team: TeamIcon,
  review: ClipboardIcon,
} as const;
export type NavIcon = keyof typeof NAV_ICONS;
