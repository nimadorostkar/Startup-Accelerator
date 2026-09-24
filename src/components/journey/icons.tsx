import type { ReactNode } from "react";

function Stroke({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const TargetIcon = ({ className }: { className?: string }) => (
  <Stroke className={className}>
    <path d="M20.6 9.6A9 9 0 1 1 14.4 3.4" />
    <path d="M16.3 10.9a4.5 4.5 0 1 1-3.2-3.2" />
    <circle cx="12" cy="12" r="0.9" fill="currentColor" />
    <path d="m12 12 7-7" />
    <path d="M16.5 3.5v3h3l2-2h-3v-3z" />
  </Stroke>
);

export const RocketIcon = ({ className }: { className?: string }) => (
  <Stroke className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </Stroke>
);

export const UserCheckIcon = ({ className }: { className?: string }) => (
  <Stroke className={className}>
    <circle cx="9" cy="7" r="4" />
    <path d="M2 21v-1.5A4.5 4.5 0 0 1 6.5 15h5" />
    <circle cx="18" cy="17" r="4" />
    <path d="m16.3 17 1.2 1.2 2.3-2.4" />
  </Stroke>
);

export const ChartIcon = ({ className }: { className?: string }) => (
  <Stroke className={className}>
    <path d="M4 21v-4M9 21v-7M14 21v-5M19 21v-9" />
    <path d="m3 12 5-5 4 3 7-7" />
    <path d="M15 3h4v4" />
  </Stroke>
);

export const UsersIcon = ({ className }: { className?: string }) => (
  <Stroke className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Stroke>
);

export const GearIcon = ({ className }: { className?: string }) => (
  <Stroke className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </Stroke>
);
