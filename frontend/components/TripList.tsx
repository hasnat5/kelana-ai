"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trip } from "@/services/tripService";
import TripCard from "@/components/TripCard";
import { Squiggle } from "@/components/Doodles";

type SortKey = "latest" | "oldest" | "highest_budget";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: "latest", label: "Latest" },
    { value: "oldest", label: "Oldest" },
    { value: "highest_budget", label: "Highest Budget" },
];

const CARD_TILTS = ["-rotate-1", "rotate-1", "-rotate-1", "rotate-1", "rotate-0"];

interface TripListProps {
    trips: Trip[];
}

export default function TripList({ trips }: TripListProps) {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("latest");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        const result = q
            ? trips.filter(
                  (t) =>
                      t.destination.toLowerCase().includes(q) ||
                      (t.travel_style ?? "").toLowerCase().includes(q) ||
                      t.category.toLowerCase().includes(q),
              )
            : [...trips];

        result.sort((a, b) => {
            if (sort === "latest")
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            if (sort === "oldest")
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            if (sort === "highest_budget") return b.budget - a.budget;
            return 0;
        });

        return result;
    }, [trips, query, sort]);

    if (trips.length === 0) {
        return (
            <div className="sketch-border rotate-1 flex flex-col items-center gap-3 px-5 py-10 text-center">
                <p className="font-hand text-2xl text-ink">no trips yet</p>
                <Squiggle className="mx-auto h-3 w-24 text-sky" />
                <p className="text-sm text-ink/60">
                    Generate your first trip on the home page.
                </p>
                <Link
                    href="/"
                    className="sketch-btn mt-2 inline-flex items-center gap-2 px-5 py-2.5 text-lg"
                >
                    Plan a trip
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Search + Sort toolbar */}
            <div className="flex flex-col gap-3">
                {/* Search */}
                <label className="sketch-border -rotate-1 block px-4 py-2.5">
                    <span className="font-hand text-base font-semibold text-ink/70">
                        Search
                    </span>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Where did you go?"
                        aria-label="Search trips by destination, style, or category"
                        className="mt-0.5 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink/35"
                    />
                </label>

                {/* Sort */}
                <div className="sketch-border rotate-1 flex items-center gap-2 px-4 py-2.5">
                    <span className="font-hand text-base font-semibold text-ink/70">
                        Sort
                    </span>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortKey)}
                        aria-label="Sort trips"
                        className="flex-1 cursor-pointer bg-transparent text-base text-ink outline-none"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results count when filtering */}
            {query && (
                <p className="font-hand text-sm text-ink/60">
                    {filtered.length} {filtered.length === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
                </p>
            )}

            {/* No results */}
            {filtered.length === 0 ? (
                <div className="sketch-border rotate-1 flex flex-col items-center gap-2 px-5 py-8 text-center">
                    <p className="font-hand text-2xl text-ink">no matches</p>
                    <Squiggle className="mx-auto h-3 w-24 text-blush" />
                    <p className="text-sm text-ink/60">
                        Try a different destination or travel style.
                    </p>
                    <button
                        onClick={() => setQuery("")}
                        className="font-hand text-lg font-semibold text-sky underline decoration-wavy underline-offset-4"
                    >
                        Clear search
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map((trip, index) => (
                        <TripCard
                            key={trip.id}
                            trip={trip}
                            tilt={CARD_TILTS[index % CARD_TILTS.length]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
