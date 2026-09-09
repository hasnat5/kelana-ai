"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { DoodleBackdrop, Star, Squiggle, PlaneDoodle } from "@/components/Doodles";

interface AssistantAnswer {
    answer: string;
    sources: string[];
}

const EXAMPLE_QUESTION = "Ask anything about your travel plans...";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SourceItem {
    metadata?: {
        _document_title?: string;
        document_title?: string;
    };
}

interface AskResponse {
    answer?: string;
    source?: string | string[] | SourceItem[];
    sources?: string | string[] | SourceItem[];
}

function getSourceTitles(source: AskResponse["source"]): string[] {
    if (!source) return ["No source returned."];

    if (typeof source === "string") return [source];

    return source.map((item) => {
        if (typeof item === "string") return item;
        return (
            item.metadata?._document_title ??
            item.metadata?.document_title ??
            "Untitled document"
        );
    });
}

export default function AssistantPage() {
    const router = useRouter();
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<AssistantAnswer | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAsking, setIsAsking] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem("access_token")) {
            router.replace("/login");
        }
    }, [router]);

    const canAsk = useMemo(() => question.trim().length > 0 && !isAsking, [
        question,
        isAsking,
    ]);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const cleanQuestion = question.trim();
        if (!cleanQuestion) return;

        setAnswer(null);
        setError(null);
        setIsAsking(true);

        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/api/v1/ask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ question: cleanQuestion }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.detail ?? `Ask failed (${res.status})`);
            }

            const data: AskResponse = await res.json();
            setAnswer({
                answer: data.answer?.trim() || "No answer returned.",
                sources: getSourceTitles(data.source ?? data.sources),
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to ask KelanaAI.");
        } finally {
            setIsAsking(false);
        }
    }

    return (
        <main className="relative flex-1 overflow-x-hidden bg-background px-4 py-10">
            <DoodleBackdrop />

            <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-6">
                <header className="relative text-center">
                    <Star className="absolute -left-1 top-0 h-6 w-6 text-sun float-doodle" />
                    <Star className="absolute right-1 top-4 h-4 w-4 text-blush float-doodle" />
                    <h1 className="font-hand text-4xl font-bold leading-none text-ink sm:text-5xl -rotate-1">
                        Ask KelanaAI
                    </h1>
                    <p className="mt-2 rotate-1 font-hand text-xl text-ink/70">
                        Powered by your trusted travel documents ~
                    </p>
                    <Squiggle className="mx-auto mt-2 h-3 w-28 text-sky" />
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="sketch-border flex -rotate-1 items-center gap-3 p-2"
                >
                    <label htmlFor="question" className="sr-only">
                        Travel question
                    </label>
                    <input
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={EXAMPLE_QUESTION}
                        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base text-ink outline-none placeholder:text-ink/35"
                    />
                    <button
                        type="submit"
                        disabled={!canAsk}
                        className="sketch-btn shrink-0 px-4 py-2 text-lg"
                    >
                        {isAsking ? "..." : "Ask"}
                    </button>
                </form>

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

                {isAsking && !answer && (
                    <div className="sketch-border-thick relative -rotate-1 px-6 py-10 text-center">
                        <PlaneDoodle className="mx-auto h-12 w-12 wobble text-ink" />
                        <p className="mt-4 font-hand text-2xl text-ink">
                            scribbling an answer...
                        </p>
                    </div>
                )}

                {answer && (
                    <section className="sketch-border-thick relative rotate-1 px-5 py-6">
                        <Star className="absolute -right-2 -top-2 h-6 w-6 text-sun" />
                        <div className="flex flex-col gap-5">
                            <div>
                                <h2 className="font-hand text-2xl font-bold text-ink">
                                    AI Answer
                                </h2>
                                <Squiggle className="mt-1 h-3 w-24 text-mint" />
                                <div className="mt-3 text-base leading-7 text-ink/90">
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => (
                                                <p className="mb-3 last:mb-0">{children}</p>
                                            ),
                                            ul: ({ children }) => (
                                                <ul className="mb-3 list-disc pl-5 last:mb-0">
                                                    {children}
                                                </ul>
                                            ),
                                            ol: ({ children }) => (
                                                <ol className="mb-3 list-decimal pl-5 last:mb-0">
                                                    {children}
                                                </ol>
                                            ),
                                            li: ({ children }) => (
                                                <li className="mb-1 last:mb-0">{children}</li>
                                            ),
                                            strong: ({ children }) => (
                                                <strong className="font-bold">{children}</strong>
                                            ),
                                        }}
                                    >
                                        {answer.answer}
                                    </ReactMarkdown>
                                </div>
                            </div>

                            <div className="border-t-2 border-dashed border-ink/25 pt-5">
                                <h3 className="font-hand text-xl font-bold text-ink/70">
                                    Source
                                </h3>
                                <ul className="mt-2 flex flex-col gap-1 text-sm text-ink/80">
                                    {answer.sources.map((sourceTitle) => (
                                        <li key={sourceTitle} className="flex items-start gap-2">
                                            <span aria-hidden="true" className="text-sky">▤</span>
                                            <span className="break-all">{sourceTitle}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
