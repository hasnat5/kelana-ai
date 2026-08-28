// Shared hand-drawn doodle decorations used across the app.
// Keeping these in one place gives every page the same sketch vocabulary.

export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 1.5l2.1 6.6H21l-5.4 4 2.1 6.6L12 14.8 6.3 18.7l2.1-6.6L3 8.1h6.9L12 1.5z" />
    </svg>
  );
}

export function Heart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 21s-6.2-3.8-9-7.4C1.2 11.2 1.5 7.8 4 6c2-1.4 4.4-.8 5.8 1.1L12 9.2l2.2-2.1C15.6 5.2 18 4.6 20 6c2.5 1.8 2.8 5.2 1 7.6C18.2 17.2 12 21 12 21z" />
    </svg>
  );
}

export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 12" fill="none" className={className}>
      <path
        d="M2 7c8-6 14 6 22 0s14 6 22 0 14 6 22 0 14 6 22 0 14 6 22 0"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Scribble({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 24" fill="none" className={className}>
      <path
        d="M3 12c6-8 10 8 16 0s10 8 16 0 10 8 16 0 8 6 10 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlaneDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path
        d="M8 34l48-14-12 18-8 2-4 10-6-8-10 2 6-12z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path
        d="M20 40l-6 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-8 top-24 h-40 w-40 rounded-full bg-blush/50 blur-2xl" />
      <div className="absolute -right-10 top-72 h-48 w-48 rounded-full bg-sky/30 blur-2xl" />
      <div className="absolute bottom-40 left-1/3 h-32 w-32 rounded-full bg-sun/25 blur-2xl" />

      <Star className="absolute left-[8%] top-[18%] h-6 w-6 text-sun/80" />
      <Star className="absolute right-[10%] top-[28%] h-4 w-4 text-blush" />
      <Heart className="absolute right-[6%] top-[55%] h-7 w-7 text-blush/80 rotate-12" />
      <PlaneDoodle className="absolute left-[4%] top-[62%] h-10 w-10 text-ink/20 -rotate-12" />
      <Star className="absolute bottom-[22%] right-[18%] h-5 w-5 text-sky" />
      <Scribble className="absolute left-[12%] bottom-[30%] h-8 w-16 text-ink/15 rotate-6" />
    </div>
  );
}
