import React from 'react';

type P = React.SVGProps<SVGSVGElement>;

function base(path: React.ReactNode, props: P) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {path}
    </svg>
  );
}

export const IconDashboard = (p: P) => base(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>, p);
export const IconMap = (p: P) => base(<><path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></>, p);
export const IconGrid = (p: P) => base(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M3 14.5h18M9 4v16M15 4v16" /></>, p);
export const IconTarget = (p: P) => base(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /></>, p);
export const IconAlert = (p: P) => base(<><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></>, p);
export const IconBulb = (p: P) => base(<><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.2 1.3 2h4.6c.2-.8.7-1.5 1.3-2A6 6 0 0 0 12 3Z" /></>, p);
export const IconHistory = (p: P) => base(<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 4v4h4" /><path d="M12 7.5V12l3 2" /></>, p);
export const IconCompare = (p: P) => base(<><path d="M4 20V9M10 20V4M16 20v-7M22 20H2" /></>, p);
export const IconBell = (p: P) => base(<><path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z" /><path d="M10.3 20a2 2 0 0 0 3.4 0" /></>, p);
export const IconChart = (p: P) => base(<><path d="M3 3v18h18" /><path d="m7 14 3.5-4 3 3L20 6" /></>, p);
export const IconFile = (p: P) => base(<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>, p);
export const IconCpu = (p: P) => base(<><rect x="7" y="7" width="10" height="10" rx="1.5" /><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" /></>, p);
export const IconInfo = (p: P) => base(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>, p);
export const IconLayers = (p: P) => base(<><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5M3 17l9 5 9-5" /></>, p);
export const IconX = (p: P) => base(<path d="M18 6 6 18M6 6l12 12" />, p);
export const IconStar = (p: P) => base(<path d="m12 3.5 2.6 5.4 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.9L12 3.5Z" />, p);
export const IconStarFilled = (p: P) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="m12 3.5 2.6 5.4 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.9L12 3.5Z" />
  </svg>
);
export const IconArrowRight = (p: P) => base(<path d="M5 12h14m-6-6 6 6-6 6" />, p);
export const IconArrowDown = (p: P) => base(<path d="M12 5v14m-6-6 6 6 6-6" />, p);
export const IconRefresh = (p: P) => base(<><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /></>, p);
export const IconMenu = (p: P) => base(<path d="M4 6h16M4 12h16M4 18h16" />, p);
export const IconSearch = (p: P) => base(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>, p);
export const IconActivity = (p: P) => base(<path d="M3 12h4l3 8 4-16 3 8h4" />, p);
export const IconFilter = (p: P) => base(<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />, p);
export const IconGlobe = (p: P) => base(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" /></>, p);
export const IconClock = (p: P) => base(<><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3.5 2" /></>, p);
export const IconShield = (p: P) => base(<><path d="M12 3 5 6v5.5c0 4.4 2.9 8.3 7 9.5 4.1-1.2 7-5.1 7-9.5V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>, p);
export const IconWaves = (p: P) => base(<><path d="M3 8c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" /><path d="M3 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" /></>, p);
export const IconChevronRight = (p: P) => base(<path d="m9 6 6 6-6 6" />, p);
export const IconChevronLeft = (p: P) => base(<path d="m15 6-6 6 6 6" />, p);
export const IconDownload = (p: P) => base(<><path d="M12 3v12m-4-4 4 4 4-4" /><path d="M4 19h16" /></>, p);
export const IconCheck = (p: P) => base(<path d="m5 13 4 4 10-10" />, p);
export const IconEye = (p: P) => base(<><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.6" /></>, p);
export const IconBook = (p: P) => base(<><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5Z" /></>, p);

/* --------------------------------------------------------------- wordmark */

export function NirikshanMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18.5" fill="#e7f2fc" stroke="#b9d9f6" />
      <circle cx="20" cy="20" r="12" stroke="#2c7fbe" strokeWidth="1.6" opacity="0.75" />
      <circle cx="20" cy="20" r="7" stroke="#1c6fb2" strokeWidth="1.8" />
      <path d="M20 3.5v6M20 30.5v6M3.5 20h6M30.5 20h6" stroke="#5aa8e4" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="26.6" cy="13.4" r="3.4" fill="#dd5145" />
      <circle cx="26.6" cy="13.4" r="3.4" fill="#dd5145" opacity="0.35" className="animate-pulseRing" style={{ transformOrigin: '26.6px 13.4px' }} />
    </svg>
  );
}
