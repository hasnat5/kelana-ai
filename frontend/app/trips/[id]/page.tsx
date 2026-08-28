import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip } from "@/services/tripService";
import DayCards from "@/components/DayCards";
import {
    DoodleBackdrop,
    Squiggle,
    Star,
    PlaneDoodle,
} from "@/components/Doodles";
import { getDestinationImageUrl } from "@/lib/destination";

interface TripDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
    const { id } = await params;
    const tripId = Number(id);

    if (isNaN(tripId)) notFound();

    let trip: Awaited<ReturnType<typeof getTrip>>;
    try {
        trip = await getTrip(tripId);
    } catch {
        notFound();
    }

    const heroUrl = getDestinationImageUrl(trip.destination);
    const categoryLabel =
        trip.category.charAt(0).toUpperCase() + trip.category.slice(1);

    const details: {
        label: string;
        value: string;
        tilt: string;
        accent: string;
    }[] = [
        {
            label: "Destination",
            value: trip.destination,
            tilt: "-rotate-1",
            accent: "bg-mint/50",
        },
        {
            label: "Budget",
            value: `USD ${trip.budget.toLocaleString()}`,
            tilt: "rotate-1",
            accent: "bg-blush/50",
        },
        {
            label: "Category",
            value: categoryLabel,
            tilt: "rotate-1",
            accent: "bg-sun/50",
        },
        {
            label: "Days",
            value: `${trip.days} ${trip.days === 1 ? "day" : "days"}`,
            tilt: "-rotate-1",
            accent: "bg-sky/40",
        },
        {
            label: "Travel Style",
            value: trip.travel_style ?? "—",
            tilt: "-rotate-1",
            accent: "bg-mint/40",
        },
        {
            label: "Daily Budget",
            value: `USD ${trip.daily_budget.toLocaleString()}`,
            tilt: "rotate-1",
            accent: "bg-blush/40",
        },
    ];

    return (
        <div className="relative flex min-h-full flex-1 flex-col overflow-x-hidden bg-background">
            <DoodleBackdrop />

            <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
                {/* Back link */}
                <Link
                    href="/trips"
                    className="mb-6 inline-flex w-fit items-center gap-1 font-hand text-lg font-semibold text-ink underline decoration-wavy decoration-sky underline-offset-4 hover:text-sky"
                >
                    ← Back to Trip History
                </Link>

                {/* Hero image */}
                <div className="relative">
                    <div className="rough-cut relative -rotate-1 aspect-video w-full bg-mint/40 sm:aspect-2/1">
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

                {/* Detail grid */}
                <div className="mt-8 grid grid-cols-2 gap-3">
                    {details.map((d) => (
                        <div
                            key={d.label}
                            className={`sketch-border px-4 py-3 ${d.accent} ${d.tilt}`}
                        >
                            <p className="font-hand text-lg font-semibold text-ink/70">
                                {d.label}
                            </p>
                            <p className="mt-0.5 text-base font-semibold text-ink">
                                {d.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* AI Recommendation */}
                {trip.ai_recommendation && (
                    <section className="relative mt-8">
                        <div className="mb-4 -rotate-2">
                            <h2 className="font-hand text-3xl font-bold text-ink sm:text-4xl">
                                AI Recommendation
                            </h2>
                            <Squiggle className="mt-1 h-3 w-36 text-sky" />
                        </div>

                        <DayCards text={trip.ai_recommendation} />
                    </section>
                )}

                {/* Back home */}
                <div className="mt-8">
                    <Link
                        href="/"
                        className="sketch-btn w-full px-4 py-3 text-center text-2xl"
                    >
                        Plan Another Trip
                    </Link>
                </div>
            </main>

            <footer className="relative z-10 mt-auto px-4 py-8 text-center">
                <PlaneDoodle className="mx-auto mb-3 h-8 w-8 text-ink/30" />
                <p className="font-hand text-xl text-ink">
                    © {new Date().getFullYear()} Made by Hasnat Ferdiananda
                </p>
            </footer>
        </div>
    );
}
