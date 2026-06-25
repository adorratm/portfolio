import Link from 'next/link';

interface ContactFabProps {
  label: string;
  href: string;
}

/** İletişim FAB — hover tooltip + pulse glow */
export function ContactFab({ label, href }: ContactFabProps) {
  return (
    <div className="group fixed bottom-8 right-8 z-50">
      <div className="pointer-events-none absolute -top-12 right-0 whitespace-nowrap rounded-lg bg-primary px-4 py-2 font-mono text-sm text-on-primary opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </div>
      <Link
        href={href}
        className="pulse-animation flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_0_20px_rgba(189,147,249,0.4)] transition-all hover:scale-110 active:scale-95"
        title={label}
      >
        <span className="text-2xl">✉</span>
      </Link>
    </div>
  );
}
