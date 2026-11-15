"use client";

export default function FacebookSignIn() {
  return (
    <a
      href="/api/auth/facebook"
      className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#1877F2] bg-[#1877F2] px-5 py-3 text-base font-bold text-white transition hover:bg-[#166FE5] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-200"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8h3.4Z" />
      </svg>
      Continuer avec Facebook
    </a>
  );
}
