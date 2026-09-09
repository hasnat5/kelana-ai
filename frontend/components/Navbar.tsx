"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PlaneDoodle } from "@/components/Doodles";

const NAV_LINKS = [
    { href: "/", label: "Plan a Trip" },
    { href: "/assistant", label: "Ask" },
    { href: "/chat", label: "Chat" },
    { href: "/trips", label: "My Trips" },
];

const LINK_TILTS = ["-rotate-1", "rotate-1", "-rotate-1", "rotate-1"];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [loggedIn, setLoggedIn] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Sync login state on every route change
    useEffect(() => {
        const syncMenu = window.setTimeout(() => {
            setLoggedIn(!!localStorage.getItem("access_token"));
            setMenuOpen(false);
        }, 0);

        return () => window.clearTimeout(syncMenu);
    }, [pathname]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function isActive(href: string) {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    }

    function handleLogout() {
        localStorage.removeItem("access_token");
        setLoggedIn(false);
        setMenuOpen(false);
        router.push("/login");
    }

    return (
        <header className="w-full border-b-2 border-dashed border-ink/20 bg-background">
            <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-1.5 font-hand text-2xl font-bold text-ink -rotate-1 transition-transform duration-150 hover:rotate-0"
                >
                    <PlaneDoodle className="h-6 w-6 text-sky" />
                    KelanaAI
                </Link>

                {/* Nav links + avatar */}
                <nav className="flex items-center gap-2" aria-label="Main navigation">
                    {NAV_LINKS.map(({ href, label }, index) => (
                        <Link
                            key={href}
                            href={href}
                            className={`px-3 py-1 font-hand text-lg transition-transform duration-150 ${LINK_TILTS[index]} ${isActive(href)
                                ? "sketch-border bg-sun font-bold text-ink shadow-[2px_2px_0_#1c1917]"
                                : "text-ink/60 hover:-translate-y-0.5 hover:rotate-0 hover:text-ink"
                                }`}
                        >
                            {label}
                        </Link>
                    ))}

                    {/* Avatar dropdown — only when logged in */}
                    {loggedIn && (
                        <div className="relative ml-1" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((o) => !o)}
                                aria-label="Open user menu"
                                aria-expanded={menuOpen}
                                className="sketch-border-thick flex h-9 w-9 rotate-2 items-center justify-center bg-sky text-white transition-transform duration-150 hover:rotate-0 cursor-pointer select-none"
                            >
                                {/* Generic avatar icon — no name available at navbar level */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-4 h-4"
                                    aria-hidden="true"
                                >
                                    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4Z" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <div className="sketch-border-thick absolute right-0 mt-2 w-44 rotate-1 overflow-hidden z-50 shadow-[4px_4px_0_rgba(28,25,23,0.2)]">
                                    <Link
                                        href="/profile"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-3 font-hand text-lg text-ink/80 transition-colors duration-150 hover:bg-mint/40 hover:text-ink"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="w-4 h-4 text-ink/50"
                                            aria-hidden="true"
                                        >
                                            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4Z" />
                                        </svg>
                                        Profile
                                    </Link>

                                    <div className="border-t-2 border-dashed border-ink/20" />

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-3 font-hand text-lg text-ink/80 transition-colors duration-150 hover:bg-blush/60 hover:text-ink cursor-pointer"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="w-4 h-4 text-ink/50"
                                            aria-hidden="true"
                                        >
                                            <path d="M16 13v-2H7V8l-5 4 5 4v-3h9Zm1-9H9a2 2 0 0 0-2 2v3h2V6h8v12H9v-3H7v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
