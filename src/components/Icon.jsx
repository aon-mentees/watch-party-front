import React from "react";

const icons = {
  clapper: () => (
    <>
      <path d="M3 9h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 9l4-5h6l-4 5" />
      <path d="M13 4l4 5" />
      <path d="M8 4l4 5" />
    </>
  ),
  popcorn: () => (
    <>
      <path d="M7 7c0-1.656 1.567-3 3.5-3 .6 0 1.169.13 1.666.36A3.5 3.5 0 0 1 17 7" />
      <path d="M7 7H5l2 13h10l2-13h-2" />
      <path d="M9.5 7l1 13" />
      <path d="M12.5 7l1 13" />
      <path d="M15 7l-1 13" />
    </>
  ),
  trash: () => (
    <>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12" />
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </>
  ),
  warning: () => (
    <>
      <path d="M12 3 2 20h20z" />
      <path d="M12 9v5" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  chat: () => (
    <>
      <path d="M21 12c0 3.866-3.806 7-8.5 7a9.6 9.6 0 0 1-3.5-.62L3 20l1.5-3.5A6.9 6.9 0 0 1 3.5 12C3.5 8.134 7.306 5 12 5s9 3.134 9 7z" />
    </>
  ),
  drama: () => (
    <>
      <path d="M5 4h14v6a7 7 0 0 1-7 7 7 7 0 0 1-7-7z" />
      <path d="M9 11c.5.667 1.167 1 2 1s1.5-.333 2-1" />
      <path d="M9 8h.01" />
      <path d="M15 8h.01" />
      <path d="M7 4l-2 4a6 6 0 0 0 4 6" />
    </>
  ),
  users: () => (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M4 20v-1a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v1" />
      <path d="M16 11a3 3 0 1 0 0-6" />
      <path d="M18 20v-1a4 4 0 0 0-3-3.87" />
    </>
  ),
  heart: () => <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  camera: () => (
    <>
      <rect x="3" y="5" width="15" height="14" rx="2" />
      <path d="M18 8l3-2v12l-3-2" />
      <circle cx="10" cy="12" r="3" />
    </>
  ),
  calendar: () => (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </>
  ),
  clock: () => (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 10v4l2.5 1.5" />
    </>
  ),
  video: () => (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="M16 8l5-2v12l-5-2z" />
    </>
  ),
  spinner: () => (
    <>
      <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </>
  ),
  upload: () => (
    <>
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </>
  ),
  check: () => <path d="M5 13l4 4L19 7" />,
  lock: () => (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  user: () => (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20a6 6 0 0 1 12 0" />
    </>
  ),
  party: () => (
    <>
      <path d="M4 20l3-9 9 3-12 6z" />
      <path d="M14 4l1 2" />
      <path d="M18 5l-1 2" />
      <path d="M21 3l-1 2" />
      <path d="M12 6l1 2" />
      <path d="M15 9l1 2" />
    </>
  ),
  search: () => (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M17 17l4 4" />
    </>
  ),
  close: () => (
    <>
      <path d="M6 6l12 12" />
      <path d="M6 18L18 6" />
    </>
  ),
  wave: () => (
    <>
      <path d="M7 9c0-1.5 1-3 2-3s2 1.5 2 3v4" />
      <path d="M11 9c0-1.5 1-3 2-3s2 1.5 2 3v5" />
      <path d="M5 12c0-1.5 1-3 2-3s2 1.5 2 3v5" />
      <path d="M15 11c0-1.5 1-3 2-3s2 1.5 2 3v3" />
    </>
  ),
};

const Icon = ({ name, size = 24, className = "", strokeWidth = 1.75, title }) => {
  const renderIcon = icons[name];
  if (!renderIcon) return null;

  return (
    <svg
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      {renderIcon()}
    </svg>
  );
};

export default Icon;
