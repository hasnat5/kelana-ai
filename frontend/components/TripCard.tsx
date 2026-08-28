import Link from "next/link";
import { Trip } from "@/services/tripService";
import { Star } from "@/components/Doodles";

// Hand-drawn accent per category — maps to the doodle palette.
const CATEGORY_STYLES: Record<string, { badge: string; star: string }> = {
  backpacker: {
    badge: "bg-mint/70 text-ink",
    star: "text-mint",
  },
  luxury: {
    badge: "bg-sun/80 text-ink",
    star: "text-sun",
  },
  standard: {
    badge: "bg-sky/60 text-ink",
    star: "text-sky",
  },
};

function getCategoryStyle(category: string) {
  return (
    CATEGORY_STYLES[category.toLowerCase()] ?? {
      badge: "bg-blush/60 text-ink",
      star: "text-blush",
    }
  );
}

interface TripCardProps {
  trip: Trip;
  tilt?: string;
}

export default function TripCard({ trip, tilt = "" }: TripCardProps) {
  const style = getCategoryStyle(trip.category);
  const label =
    trip.category.charAt(0).toUpperCase() + trip.category.slice(1);

  return (
    <Link
      href={`/trips/${trip.id}`}
      className={`sketch-border group relative flex items-center justify-between gap-4 px-5 py-4 transition-transform duration-150 hover:-translate-y-0.5 hover:rotate-0 ${tilt}`}
    >
      <Star
        className={`absolute -right-2 -top-2 h-5 w-5 ${style.star} float-doodle`}
      />

      {/* Left: icon + info */}
      <div className="flex items-center gap-4">
        {/* Airplane doodle icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky/20 text-ink"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-hand text-xl font-bold text-ink">
              {trip.destination}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}
            >
              {label}
            </span>
          </div>
          <p className="text-sm text-ink/70">
            {trip.days} {trip.days === 1 ? "day" : "days"} · USD{" "}
            {trip.budget.toLocaleString()} · {trip.travel_style ?? "—"}
          </p>
        </div>
      </div>

      {/* Right: view details chevron */}
      <span className="inline-flex shrink-0 items-center gap-1 font-hand text-lg font-semibold text-ink group-hover:text-sky">
        View
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </Link>
  );
}
