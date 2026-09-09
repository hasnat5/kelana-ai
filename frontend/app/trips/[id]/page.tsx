"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getTrip, type Trip } from "@/services/tripService";
import DayCards from "@/components/DayCards";
import { DoodleBackdrop, PlaneDoodle, Star, Squiggle } from "@/components/Doodles";

// Hand-drawn accent per category — maps to the doodle palette.
const CATEGORY_BADGE: Record<string, string> = {
    backpacker: "bg-mint/70 text-ink",
    luxury: "bg-sun/80 text-ink",
    standard: "bg-sky/60 text-ink",
};

export default function TripDetailPage() {
    const router = useRouter();
    const params = useParams();
    const tripId = Number(params.id);
    const invalidId = Number.isNaN(tripId);

    const [trip, setTrip] = useState<Trip | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.replace("/login");
            return;
        }

        if (Number.isNaN(tripId)) return;

        getTrip(tripId, token)
            .then(setTrip)
            .catch((err) => setError(err instanceof Error ? err.message : "Trip not found."));
    }, [tripId, router]);

    if (invalidId || error) {
        return (
            <main className="relative flex min-h-screen flex-col items-center overflow-x-hidden bg-background px-4 py-10">
                <DoodleBackdrop />
                <div className="relative z-10 flex w-full max-w-lg flex-col gap-4">
                    <div
                        role="alert"
                        className="sketch-border rotate-1 bg-blush/60 px-5 py-4 text-center text-sm font-semibold text-ink"
                    >
                        <span className="font-hand text-lg">oops!</span>
                        <br />
                        {invalidId ? "Invalid trip ID." : error}
                    </div>
                    <Link href="/trips" className="sketch-btn w-full px-4 py-3 text-xl">
                        ← Back to Trip History
                    </Link>
                </div>
            </main>
        );
    }

    if (!trip) {
        return (
            <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-background">
                <DoodleBackdrop />
                <div className="sketch-border-thick relative z-10 -rotate-1 px-8 py-10 text-center">
                    <PlaneDoodle className="mx-auto h-12 w-12 wobble text-ink" />
                    <p className="mt-4 font-hand text-2xl text-ink">
                        digging up your itinerary...
                    </p>
                </div>
            </main>
        );
    }

    const badgeClass =
        CATEGORY_BADGE[trip.category.toLowerCase()] ?? "bg-blush/60 text-ink";

    return (
        <main className="relative min-h-screen overflow-x-hidden bg-background px-4 py-10">
            <DoodleBackdrop />

            <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-6">

                <header className="relative">
                    <Star className="absolute -left-1 -top-1 h-6 w-6 text-sun float-doodle" />
                    <h1 className="font-hand text-4xl font-bold leading-none text-ink -rotate-1">
                        {trip.destination}
                    </h1>
                    <p className="mt-2 rotate-1 font-hand text-xl text-ink/60">
                        {trip.days} {trip.days === 1 ? "day" : "days"} of adventure ~
                    </p>
                    <Squiggle className="mt-2 h-3 w-28 text-sky" />
                </header>

                <div className="grid grid-cols-2 gap-4">
                    <DetailCard
                        label="Destination"
                        value={trip.destination}
                        tilt="-rotate-1"
                        accent="bg-mint/50"
                    />
                    <DetailCard
                        label="Budget"
                        value={`USD ${trip.budget.toLocaleString()}`}
                        tilt="rotate-1"
                        accent="bg-blush/50"
                    />
                    <DetailCard
                        label="Category"
                        value={trip.category.charAt(0).toUpperCase() + trip.category.slice(1)}
                        badgeClass={badgeClass}
                        tilt="rotate-1"
                        accent="bg-sky/30"
                    />
                    <DetailCard
                        label="Days"
                        value={`${trip.days} ${trip.days === 1 ? "day" : "days"}`}
                        tilt="-rotate-1"
                        accent="bg-paper"
                    />
                </div>

                {trip.ai_recommendation && (
                    <section className="flex flex-col gap-3">
                        <div className="-rotate-2">
                            <h2 className="font-hand text-3xl font-bold text-ink">
                                AI Recommendation
                            </h2>
                            <Squiggle className="mt-1 h-3 w-36 text-sky" />
                        </div>
                        <DayCards text={trip.ai_recommendation} />
                    </section>
                )}

                <Link href="/trips" className="sketch-btn mt-2 w-full px-4 py-3 text-2xl">
                    ← Back to Trip History
                </Link>

            </div>
        </main>
    );
}

function DetailCard({
    label,
    value,
    badgeClass,
    tilt = "",
    accent = "bg-paper",
}: {
    label: string;
    value: string;
    badgeClass?: string;
    tilt?: string;
    accent?: string;
}) {
    return (
        <div className={`sketch-border relative px-4 py-3.5 ${accent} ${tilt}`}>
            <p className="font-hand text-lg font-semibold text-ink/70">{label}</p>
            {badgeClass ? (
                <span className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
                    {value}
                </span>
            ) : (
                <p className="mt-0.5 text-base font-semibold text-ink">{value}</p>
            )}
        </div>
    );
}
