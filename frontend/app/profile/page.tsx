"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DoodleBackdrop, Heart, Star, Squiggle } from "@/components/Doodles";
import { getMe, type MeResponse } from "@/services/authService";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<MeResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.replace("/login");
            return;
        }

        getMe(token)
            .then(setUser)
            .catch((err) => {
                setError(err instanceof Error ? err.message : "Failed to load profile.");
            });
    }, [router]);

    if (error) {
        return (
            <main className="relative flex flex-1 items-center justify-center px-4 py-10 bg-background">
                <DoodleBackdrop />
                <div
                    role="alert"
                    className="sketch-border relative z-10 w-full max-w-lg rotate-1 bg-blush/60 px-5 py-4 text-center text-sm font-semibold text-ink"
                >
                    <span className="font-hand text-lg">oops!</span>
                    <br />
                    {error}
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="relative flex flex-1 items-center justify-center bg-background">
                <DoodleBackdrop />
                <div className="sketch-border-thick relative z-10 -rotate-1 px-8 py-10 text-center">
                    <Heart className="mx-auto h-12 w-12 wobble text-blush" />
                    <p className="mt-4 font-hand text-2xl text-ink">
                        flipping through your notebook...
                    </p>
                </div>
            </main>
        );
    }

    const initials = user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <main className="relative flex flex-1 flex-col items-center overflow-x-hidden px-4 py-10 bg-background">
            <DoodleBackdrop />

            <div className="relative z-10 flex w-full max-w-lg flex-col gap-6">

                {/* Avatar + name */}
                <div className="relative flex flex-col items-center gap-3 py-6">
                    <Star className="absolute left-2 top-0 h-5 w-5 text-sun float-doodle" />
                    <Star className="absolute right-4 top-8 h-4 w-4 text-blush float-doodle" />
                    <div className="sketch-border-thick flex h-20 w-20 -rotate-2 items-center justify-center bg-sun select-none shadow-[3px_3px_0_#1c1917]">
                        <span className="font-hand text-3xl font-bold text-ink">
                            {initials}
                        </span>
                    </div>
                    <div className="text-center">
                        <h1 className="font-hand text-4xl font-bold leading-none text-ink -rotate-1">
                            {user.name}
                        </h1>
                        <p className="mt-2 rotate-1 font-hand text-xl text-ink/60">
                            Member since {joinedDate}
                        </p>
                        <Squiggle className="mx-auto mt-2 h-3 w-28 text-sky" />
                    </div>
                </div>

                {/* Info cards */}
                <div className="flex flex-col gap-4">
                    <Row
                        label="Email"
                        value={user.email}
                        tilt="-rotate-1"
                        accent="bg-mint/50"
                    />
                    <Row
                        label="Trips generated"
                        value={String(user.total_trips)}
                        tilt="rotate-1"
                        accent="bg-blush/50"
                    />
                </div>

            </div>
        </main>
    );
}

function Row({
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
        <div className={`sketch-border flex items-center justify-between gap-4 px-5 py-4 ${accent} ${tilt}`}>
            <span className="font-hand text-lg font-semibold text-ink/70">
                {label}
            </span>
            <span className="text-sm font-semibold text-ink break-all text-right">
                {value}
            </span>
        </div>
    );
}
