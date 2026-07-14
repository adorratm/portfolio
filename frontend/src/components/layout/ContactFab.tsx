import Link from 'next/link';

interface ContactFabProps {
  label: string;
  href: string;
}

/** Klasik filled e-posta zarfı */
function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4-8 5-8-5V6l8 5 8-5z"
      />
    </svg>
  );
}

/** İletişim FAB — hover tooltip + pulse glow */
export function ContactFab({ label, href }: ContactFabProps) {
  return (
    <div className="group fixed right-8 bottom-8 z-50">
      <div className="pointer-events-none absolute -top-12 right-0 whitespace-nowrap rounded-lg bg-primary px-4 py-2 font-mono text-sm text-on-primary opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </div>
      <Link
        href={href}
        className="pulse-animation flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_0_20px_rgba(189,147,249,0.4)] transition-all hover:scale-110 active:scale-95"
        title={label}
        aria-label={label}
      >
        <EmailIcon className="text-3xl" />
      </Link>
    </div>
  );
}
