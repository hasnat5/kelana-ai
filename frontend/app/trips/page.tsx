"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type Trip } from "@/services/tripService";
import TripList from "@/components/TripList";
import { DoodleBackdrop, PlaneDoodle, Star, Squiggle } from "@/components/Doodles";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TripsPage() {
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.replace("/login");
            return;
        }

        fetch(`${API_URL}/api/v1/trips`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.detail ?? `Failed to fetch trips (${res.status})`);
                }
                return res.json() as Promise<Trip[]>;
            })
            .then(setTrips)
            .catch((err) => setError(err instanceof Error ? err.message : "Failed to load trips."))
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) {
        return (
            <main className="relative flex flex-1 items-center justify-center overflow-x-hidden bg-background">
                <DoodleBackdrop />
                <div className="sketch-border-thick relative z-10 -rotate-1 px-8 py-10 text-center">
                    <PlaneDoodle className="mx-auto h-12 w-12 wobble text-ink" />
                    <p className="mt-4 font-hand text-2xl text-ink">
                        flipping through your trips...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-x-hidden bg-background px-4 py-10">
            <DoodleBackdrop />

            <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-6">

                <header className="relative">
                    <Star className="absolute -left-1 -top-1 h-5 w-5 text-sun float-doodle" />
                    <h1 className="font-hand text-4xl font-bold leading-none text-ink -rotate-1">
                        Trip History
                    </h1>
                    {!error && (
                        <p className="mt-2 rotate-1 font-hand text-xl text-ink/60">
                            {trips.length} saved {trips.length === 1 ? "itinerary" : "itineraries"}
                        </p>
                    )}
                    <Squiggle className="mt-2 h-3 w-28 text-sky" />
                </header>

                {error && (
                    <div
                        role="alert"
                        className="sketch-border rotate-1 bg-blush/60 px-5 py-4 text-center text-sm font-semibold text-ink"
                    >
                        <span className="font-hand text-lg">oops!</span>
                        <br />
                        {error}
                    </div>
                )}

                {!error && <TripList trips={trips} />}

            </div>
        </main>
    );
}
