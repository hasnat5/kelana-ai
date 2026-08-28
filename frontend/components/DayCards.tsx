"use client";

import ReactMarkdown from "react-markdown";
import { Star, Squiggle } from "@/components/Doodles";

type DaySection = {
    title: string;
    body: string;
};

const DAY_TILTS = ["-rotate-1", "rotate-1", "-rotate-1", "rotate-1", "rotate-0"];

function parseDaySections(text: string): DaySection[] | null {
    const dayLineRe = /^(?:#{1,3}\s+|(?:\*\*))?(Day\s+\d+[^\n]*?)(?:\*\*)?$/im;

    const parts = text.split(
        /^((?:#{1,3}\s+)?(?:\*\*)?Day\s+\d+[^\n]*?(?:\*\*)?)$/gim,
    );

    const sections: DaySection[] = [];
    let i = 0;

    while (i < parts.length && !dayLineRe.test(parts[i])) i++;

    while (i < parts.length - 1) {
        const rawTitle = parts[i].trim();
        const rawBody = (parts[i + 1] ?? "").trim();

        if (dayLineRe.test(rawTitle)) {
            const cleanTitle = rawTitle
                .replace(/^#{1,3}\s+/, "")
                .replace(/^\*\*|\*\*$/g, "");
            sections.push({ title: cleanTitle, body: rawBody });
            i += 2;
        } else {
            i++;
        }
    }

    return sections.length > 0 ? sections : null;
}

const mdComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
    h1: ({ children }) => (
        <p className="mb-1 font-hand text-lg font-bold text-ink">{children}</p>
    ),
    h2: ({ children }) => (
        <p className="mb-1 font-hand text-lg font-bold text-ink">{children}</p>
    ),
    h3: ({ children }) => (
        <p className="mb-1 font-hand text-lg font-bold text-ink">{children}</p>
    ),
    p: ({ children }) => (
        <p className="mb-1 text-sm leading-relaxed text-ink/80 last:mb-0">
            {children}
        </p>
    ),
    ul: ({ children }) => (
        <ul className="mb-1 space-y-1 text-sm text-ink/80 last:mb-0">{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="mb-1 space-y-1 text-sm text-ink/80 last:mb-0 list-decimal list-inside">
            {children}
        </ol>
    ),
    li: ({ children }) => (
        <li className="flex items-start gap-2 leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky" />
            <span>{children}</span>
        </li>
    ),
    strong: ({ children }) => (
        <strong className="font-semibold text-ink">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-ink/60">{children}</em>,
    hr: () => <Squiggle className="my-2 h-3 w-full text-ink/20" />,
    blockquote: ({ children }) => (
        <blockquote className="my-1 border-l-4 border-sky pl-3 text-sm italic text-ink/60">
            {children}
        </blockquote>
    ),
    code: ({ children }) => (
        <code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-xs text-ink/80">
            {children}
        </code>
    ),
};

export default function DayCards({ text }: { text: string }) {
    const sections = parseDaySections(text);

    if (sections) {
        return (
            <div className="space-y-4">
                {sections.map((section, idx) => (
                    <article
                        key={idx}
                        className={`sketch-border relative px-4 py-3.5 sm:px-5 sm:py-4 ${DAY_TILTS[idx % DAY_TILTS.length]}`}
                    >
                        <h3 className="font-hand text-2xl font-bold text-ink">
                            {section.title}
                        </h3>
                        {section.body && (
                            <div className="mt-1">
                                <ReactMarkdown components={mdComponents}>
                                    {section.body}
                                </ReactMarkdown>
                            </div>
                        )}
                        {idx % 2 === 0 && (
                            <Star className="absolute -right-2 -top-2 h-5 w-5 text-sun" />
                        )}
                    </article>
                ))}
            </div>
        );
    }

    return (
        <article className="sketch-border rotate-1 px-4 py-3.5 sm:px-5 sm:py-4">
            <ReactMarkdown components={mdComponents}>{text}</ReactMarkdown>
        </article>
    );
}
