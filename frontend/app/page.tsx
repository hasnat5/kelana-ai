"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

type TripForm = {
  destination: string;
  budget: string;
  days: string;
  month: string;
  travelStyle: string;
};

type Trip = {
  id: number;
  destination: string;
  days: number;
  month: string;
  travel_season: string;
  budget: number;
  daily_budget: number;
  travel_style: string;
  category: string;
  ai_recommendation: string | null;
};

type DayPlan = {
  day: number;
  description: string;
};

const INITIAL_FORM: TripForm = {
  destination: "",
  budget: "",
  days: "",
  month: "",
  travelStyle: "",
};

const ERROR_MESSAGE = "unable to generate itinerary, please try again";

const FIELD_TILTS = ["-rotate-1", "rotate-1", "-rotate-1", "rotate-1", "-rotate-1"];
const DAY_TILTS = ["-rotate-1", "rotate-1", "-rotate-1", "rotate-1", "rotate-0"];

export default function Home() {
  const [form, setForm] = useState<TripForm>(INITIAL_FORM);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof TripForm>(key: K, value: TripForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/v1/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: form.destination,
          budget: Number(form.budget),
          days: Number(form.days),
          month: form.month,
          travel_style: form.travelStyle,
        }),
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGE);
      }

      const data: Trip = await response.json();
      setTrip(data);
    } catch {
      setError(ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setTrip(null);
    setError(null);
    setForm(INITIAL_FORM);
  }

  const dayPlans = trip
    ? parseItineraryDays(trip.ai_recommendation, trip.days)
    : [];

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-x-hidden bg-background">
      <DoodleBackdrop />

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        <header className="relative mb-8 text-center sm:mb-10">
          <Star className="absolute -left-1 top-0 h-7 w-7 text-sun float-doodle sm:left-4" />
          <Star className="absolute right-2 top-3 h-5 w-5 text-blush float-doodle sm:right-8" />
          <h1 className="font-hand text-5xl font-bold leading-none text-ink sm:text-6xl -rotate-1">
            KelanaAI
          </h1>
          <p className="mt-3 rotate-1 font-hand text-xl text-ink/70 sm:text-2xl">
            Plan your next adventure ~
          </p>
          <Squiggle className="mx-auto mt-3 h-3 w-28 text-sky" />
        </header>

        {loading ? (
          <LoadingState />
        ) : trip ? (
          <TripResult trip={trip} dayPlans={dayPlans} onReset={handleReset} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {(
              [
                {
                  key: "destination",
                  label: "Destination",
                  placeholder: "Japan",
                  type: "text",
                },
                {
                  key: "budget",
                  label: "Budget (USD)",
                  placeholder: "2000",
                  type: "number",
                  min: "1",
                },
                {
                  key: "days",
                  label: "Days",
                  placeholder: "5",
                  type: "number",
                  min: "1",
                },
                {
                  key: "month",
                  label: "Month",
                  placeholder: "June",
                  type: "text",
                },
                {
                  key: "travelStyle",
                  label: "Travel Style",
                  placeholder: "Family",
                  type: "text",
                },
              ] as const
            ).map((field, index) => (
              <Field
                key={field.key}
                label={field.label}
                value={form[field.key]}
                onChange={(value) => updateField(field.key, value)}
                placeholder={field.placeholder}
                type={field.type}
                min={"min" in field ? field.min : undefined}
                required
                tilt={FIELD_TILTS[index]}
              />
            ))}

            {error && (
              <p
                role="alert"
                className="sketch-border rotate-1 bg-blush/60 px-4 py-3 text-center text-sm font-semibold text-ink"
              >
                <span className="font-hand text-lg">oops!</span>
                <br />
                {ERROR_MESSAGE}
              </p>
            )}

            <div className="pt-2">
              <button type="submit" className="sketch-btn w-full px-4 py-3 text-2xl">
                Generate AI Trip
              </button>
            </div>
          </form>
        )}
      </main>

      <footer className="relative z-10 mt-auto px-4 py-8 text-center">
        <Squiggle className="mx-auto mb-4 h-3 w-40 text-ink/30" />
        <p className="font-hand text-xl text-ink">
          © {new Date().getFullYear()} Made by Hasnat Ferdiananda
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <a
            href="https://instagram.com/hasnat5_"
            target="_blank"
            rel="noopener noreferrer"
            className="-rotate-1 font-semibold text-ink underline decoration-wavy decoration-sky underline-offset-4 hover:text-sky"
          >
            Instagram @hasnat5_
          </a>
          <a
            href="https://www.linkedin.com/in/hasnatf"
            target="_blank"
            rel="noopener noreferrer"
            className="rotate-1 font-semibold text-ink underline decoration-wavy decoration-blush underline-offset-4 hover:text-sky"
          >
            LinkedIn @hasnatf
          </a>
        </div>
      </footer>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="sketch-border-thick relative mx-auto flex w-full flex-col items-center px-6 py-14 text-center -rotate-1">
      <PlaneDoodle className="h-16 w-16 wobble text-ink" />
      <p className="mt-5 font-hand text-3xl text-ink">scribbling your trip...</p>
      <p className="mt-2 text-sm text-ink/60">this may take a few moments</p>
      <Star className="absolute left-4 top-4 h-5 w-5 text-sun" />
      <Star className="absolute bottom-5 right-6 h-4 w-4 text-blush" />
    </div>
  );
}

function TripResult({
  trip,
  dayPlans,
  onReset,
}: {
  trip: Trip;
  dayPlans: DayPlan[];
  onReset: () => void;
}) {
  const heroUrl = getDestinationImageUrl(trip.destination);

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="rough-cut relative aspect-video w-full bg-mint/40 -rotate-1 sm:aspect-2/1">
          <Image
            src={heroUrl}
            alt={`${trip.destination} travel destination`}
            fill
            priority
            unoptimized
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
          />
        </div>
        <div className="absolute -bottom-3 left-3 rotate-2 sketch-border bg-sun px-3 py-1 shadow-[3px_3px_0_#1c1917] sm:left-5">
          <p className="font-hand text-xl font-bold text-ink sm:text-2xl">
            {trip.destination}
          </p>
        </div>
        <Star className="absolute -right-1 -top-2 h-8 w-8 text-sun float-doodle" />
      </div>

      <div className="space-y-3 pt-4">
        <DetailField
          label="Destination"
          value={trip.destination}
          tilt="-rotate-1"
          accent="bg-mint/50"
        />
        <DetailField
          label="Budget"
          value={`${trip.budget} USD`}
          tilt="rotate-1"
          accent="bg-blush/50"
        />
        <DetailField
          label="Travel Style"
          value={trip.travel_style}
          tilt="-rotate-1"
          accent="bg-sky/30"
        />
      </div>

      <section className="relative pt-2">
        <div className="mb-4 -rotate-2">
          <h2 className="font-hand text-3xl font-bold text-ink sm:text-4xl">
            AI Recommendation
          </h2>
          <Squiggle className="mt-1 h-3 w-36 text-sky" />
        </div>

        <div className="space-y-4">
          {dayPlans.length > 0 ? (
            dayPlans.map((plan, index) => (
              <article
                key={plan.day}
                className={`sketch-border relative px-4 py-3.5 sm:px-5 sm:py-4 ${DAY_TILTS[index % DAY_TILTS.length]}`}
              >
                <h3 className="font-hand text-2xl font-bold text-ink">
                  Day {plan.day}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/80 sm:text-base">
                  {plan.description}
                </p>
                {index % 2 === 0 && (
                  <Star className="absolute -right-2 -top-2 h-5 w-5 text-sun" />
                )}
              </article>
            ))
          ) : (
            <article className="sketch-border rotate-1 px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80 sm:text-base">
                {trip.ai_recommendation || "No itinerary available."}
              </p>
            </article>
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={onReset}
        className="sketch-btn w-full px-4 py-3 text-2xl"
      >
        Plan Another Trip
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  required,
  tilt = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  required?: boolean;
  tilt?: string;
}) {
  return (
    <label className={`sketch-border block px-4 py-3 ${tilt}`}>
      <span className="font-hand text-lg font-semibold text-ink/70">
        {label}
      </span>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-0.5 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink/35"
      />
    </label>
  );
}

function DetailField({
  label,
  value,
  tilt = "",
  accent = "bg-paper",
}: {
  label: string;
  value: string;
  tilt?: string;
  accent?: string;
}) {
  return (
    <div className={`sketch-border px-4 py-3 ${accent} ${tilt}`}>
      <p className="font-hand text-lg font-semibold text-ink/70">{label}</p>
      <p className="mt-0.5 text-base font-semibold text-ink">{value}</p>
    </div>
  );
}

function DoodleBackdrop() {
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

function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 1.5l2.1 6.6H21l-5.4 4 2.1 6.6L12 14.8 6.3 18.7l2.1-6.6L3 8.1h6.9L12 1.5z" />
    </svg>
  );
}

function Heart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 21s-6.2-3.8-9-7.4C1.2 11.2 1.5 7.8 4 6c2-1.4 4.4-.8 5.8 1.1L12 9.2l2.2-2.1C15.6 5.2 18 4.6 20 6c2.5 1.8 2.8 5.2 1 7.6C18.2 17.2 12 21 12 21z" />
    </svg>
  );
}

function Squiggle({ className = "" }: { className?: string }) {
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

function Scribble({ className = "" }: { className?: string }) {
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

function PlaneDoodle({ className = "" }: { className?: string }) {
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

function getDestinationImageUrl(destination: string) {
  const keyword = destination
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s,-]/g, "")
    .replace(/\s+/g, ",")
    .replace(/,+/g, ",");
  return `https://loremflickr.com/1600/900/${keyword || "travel"},travel,landmark`;
}

function cleanMarkdown(text: string) {
  return text
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*/g, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseItineraryDays(
  recommendation: string | null,
  dayCount: number,
): DayPlan[] {
  if (!recommendation?.trim()) return [];

  const dayRegex =
    /(?:^|\n)\s*(?:#{1,3}\s*)?(?:\*\*)?Day\s+(\d+)(?:\*\*)?[:\s.-]*([\s\S]*?)(?=(?:\n\s*(?:#{1,3}\s*)?(?:\*\*)?Day\s+\d+)|$)/gi;

  const matches = [...recommendation.matchAll(dayRegex)];

  if (matches.length > 0) {
    return matches.map((match) => {
      const day = Number(match[1]);
      const raw = cleanMarkdown(match[2] || "");
      const description =
        summarizeDay(raw) || `Explore highlights planned for day ${day}.`;
      return { day, description };
    });
  }

  const chunks = recommendation
    .split(/\n(?=#{1,3}\s)/)
    .map((chunk) => cleanMarkdown(chunk))
    .filter(Boolean);

  if (chunks.length >= dayCount && dayCount > 0) {
    return Array.from({ length: dayCount }, (_, index) => ({
      day: index + 1,
      description:
        summarizeDay(chunks[index]) ||
        `Explore highlights planned for day ${index + 1}.`,
    }));
  }

  const summary = summarizeDay(cleanMarkdown(recommendation));
  return Array.from({ length: Math.max(dayCount, 1) }, (_, index) => ({
    day: index + 1,
    description:
      index === 0
        ? summary || "Your personalized itinerary is ready."
        : `Continue exploring based on your ${dayCount}-day plan.`,
  }));
}

function summarizeDay(text: string) {
  if (!text) return "";
  const sentence = text.split(/(?<=[.!?])\s+/)[0] || text;
  if (sentence.length <= 140) return sentence;
  return `${sentence.slice(0, 137).trimEnd()}...`;
}
