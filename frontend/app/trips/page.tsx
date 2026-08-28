import Link from "next/link";
import { getTrips } from "@/services/tripService";
import TripList from "@/components/TripList";
import { DoodleBackdrop, Squiggle, Star } from "@/components/Doodles";

export default async function TripsPage() {
    let trips: Awaited<ReturnType<typeof getTrips>> = [];
    let error: string | null = null;

    try {
        trips = await getTrips();
    } catch (err) {
        error = err instanceof Error ? err.message : "Failed to load trips.";
    }

    return (
        <div className="relative flex min-h-full flex-1 flex-col overflow-x-hidden bg-background">
            <DoodleBackdrop />

            <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
                {/* Page header */}
                <header className="relative mb-8 text-center sm:mb-10">
                    <Star className="absolute -left-1 top-0 h-7 w-7 text-sun float-doodle sm:left-4" />
                    <Star className="absolute right-2 top-3 h-5 w-5 text-blush float-doodle sm:right-8" />
                    <h1 className="-rotate-1 font-hand text-5xl font-bold leading-none text-ink sm:text-6xl">
                        Trip History
                    </h1>
                    <p className="mt-3 rotate-1 font-hand text-xl text-ink/70 sm:text-2xl">
                        your past adventures ~
                    </p>
                    <Squiggle className="mx-auto mt-3 h-3 w-28 text-sky" />
                </header>

                {/* Error state */}
                {error && (
                    <p
                        role="alert"
                        className="sketch-border rotate-1 bg-blush/60 px-4 py-3 text-center text-sm font-semibold text-ink"
                    >
                        <span className="font-hand text-lg">oops!</span>
                        <br />
                        {error}
                    </p>
                )}

                {/* Trip list with search + sort */}
                {!error && <TripList trips={trips} />}

                {/* Back home */}
                <div className="pt-8">
                    <Link
                        href="/"
                        className="sketch-btn w-full px-4 py-3 text-center text-2xl"
                    >
                        Plan a New Trip
                    </Link>
                </div>
            </main>

            <footer className="relative z-10 mt-auto px-4 py-8 text-center">
                <Squiggle className="mx-auto mb-4 h-3 w-40 text-ink/30" />
                <p className="font-hand text-xl text-ink">
                    © {new Date().getFullYear()} Made by Hasnat Ferdiananda
                </p>
            </footer>
        </div>
    );
}
