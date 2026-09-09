"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { DoodleBackdrop, Heart, PlaneDoodle, Star } from "@/components/Doodles";
import {
    createConversation,
    deleteConversation,
    getConversations,
    getMessages,
    renameConversation,
    sendMessage,
    type Conversation,
    type Message,
} from "@/services/conversationService";

type DraftMessage = Message | {
    id: number;
    conversation_id: number;
    role: "user" | "assistant";
    content: string;
    created_at: string;
    pending?: boolean;
};

function formatConversationDate(value: string) {
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function getConversationLabel(
    conversation: Conversation,
    messagesByConversation: Record<number, Message[]>
) {
    if (conversation.title) return conversation.title;

    const firstUserMessage = messagesByConversation[conversation.id]?.find(
        (message) => message.role === "user"
    );

    if (!firstUserMessage) return `Conversation ${conversation.id}`;

    return firstUserMessage.content.length > 36
        ? `${firstUserMessage.content.slice(0, 36)}...`
        : firstUserMessage.content;
}

export default function ChatPage() {
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [token, setToken] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<DraftMessage[]>([]);
    const [messagesByConversation, setMessagesByConversation] = useState<
        Record<number, Message[]>
    >({});
    const [draft, setDraft] = useState("");
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [editingConversationId, setEditingConversationId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [savingTitle, setSavingTitle] = useState(false);
    const [deletingConversationId, setDeletingConversationId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const syncToken = window.setTimeout(() => {
            const savedToken = localStorage.getItem("access_token");
            if (!savedToken) {
                router.replace("/login");
                return;
            }

            setToken(savedToken);
        }, 0);

        return () => window.clearTimeout(syncToken);
    }, [router]);

    useEffect(() => {
        if (!token) return;

        getConversations(token)
            .then((data) => {
                setConversations(data);
                if (data.length > 0) {
                    setActiveConversationId(data[0].id);
                }
            })
            .catch((err) => setError(err instanceof Error ? err.message : "Failed to load conversations."))
            .finally(() => setLoadingConversations(false));
    }, [router, token]);

    useEffect(() => {
        if (!token || activeConversationId === null) return;

        let ignore = false;
        const authToken = token;
        const selectedConversationId = activeConversationId;

        async function loadMessages() {
            setLoadingMessages(true);
            setError(null);

            try {
                const data = await getMessages(selectedConversationId, authToken);
                if (ignore) return;
                setMessages(data);
                setMessagesByConversation((prev) => ({
                    ...prev,
                    [selectedConversationId]: data,
                }));
            } catch (err) {
                if (!ignore) {
                    setError(err instanceof Error ? err.message : "Failed to load messages.");
                }
            } finally {
                if (!ignore) {
                    setLoadingMessages(false);
                }
            }
        }

        void loadMessages();

        return () => {
            ignore = true;
        };
    }, [activeConversationId, token]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loadingMessages, sending]);

    const canSend = useMemo(() => draft.trim().length > 0 && !sending, [
        draft,
        sending,
    ]);
    const activeConversation = conversations.find(
        (conversation) => conversation.id === activeConversationId
    );
    const activeConversationLabel = activeConversation
        ? getConversationLabel(activeConversation, messagesByConversation)
        : "Chat";

    async function refreshConversations(authToken: string, selectedId: number) {
        const data = await getConversations(authToken);
        setConversations(data);
        setActiveConversationId(selectedId);
    }

    async function handleNewConversation() {
        if (!token) return;

        setError(null);
        try {
            const conversationId = await createConversation(token);
            await refreshConversations(token, conversationId);
            setMessages([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create conversation.");
        }
    }

    async function handleSelectConversation(conversationId: number) {
        if (editingConversationId !== null) return;
        if (conversationId === activeConversationId) return;
        setActiveConversationId(conversationId);
        setMessages(messagesByConversation[conversationId] ?? []);
    }

    function startRenaming(conversation: Conversation) {
        setEditingConversationId(conversation.id);
        setEditingTitle(getConversationLabel(conversation, messagesByConversation));
        setError(null);
    }

    function cancelRenaming() {
        setEditingConversationId(null);
        setEditingTitle("");
    }

    async function handleRenameConversation(conversationId: number) {
        if (!token || savingTitle) return;

        const title = editingTitle.trim();
        if (!title) {
            setError("Conversation title is required.");
            return;
        }

        setSavingTitle(true);
        setError(null);

        try {
            const updatedConversation = await renameConversation(
                conversationId,
                title,
                token
            );
            setConversations((prev) =>
                prev.map((conversation) =>
                    conversation.id === conversationId ? updatedConversation : conversation
                )
            );
            cancelRenaming();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to rename conversation.");
        } finally {
            setSavingTitle(false);
        }
    }

    async function handleDeleteConversation(
        conversation: Conversation,
        label: string
    ) {
        if (!token || deletingConversationId !== null) return;

        const confirmed = window.confirm(`Delete "${label}" and all of its messages?`);
        if (!confirmed) return;

        setDeletingConversationId(conversation.id);
        setError(null);

        try {
            await deleteConversation(conversation.id, token);
            const nextConversations = conversations.filter(
                (item) => item.id !== conversation.id
            );
            setConversations(nextConversations);
            setMessagesByConversation((prev) => {
                const next = { ...prev };
                delete next[conversation.id];
                return next;
            });

            if (conversation.id === activeConversationId) {
                const nextActiveConversation = nextConversations[0] ?? null;
                setActiveConversationId(nextActiveConversation?.id ?? null);
                setMessages(
                    nextActiveConversation
                        ? messagesByConversation[nextActiveConversation.id] ?? []
                        : []
                );
            }

            if (conversation.id === editingConversationId) {
                cancelRenaming();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete conversation.");
        } finally {
            setDeletingConversationId(null);
        }
    }

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!token || !canSend) return;

        const content = draft.trim();
        setDraft("");
        setError(null);
        setSending(true);

        let conversationId = activeConversationId;

        try {
            if (conversationId === null) {
                conversationId = await createConversation(token);
                await refreshConversations(token, conversationId);
            }

            const optimisticMessage: DraftMessage = {
                id: Date.now() * -1,
                conversation_id: conversationId,
                role: "user",
                content,
                created_at: new Date().toISOString(),
                pending: true,
            };
            setMessages((prev) => [...prev, optimisticMessage]);

            const response = await sendMessage(conversationId, content, token);
            const latestMessages = await getMessages(response.conversation_id, token);
            setMessages(latestMessages);
            setMessagesByConversation((prev) => ({
                ...prev,
                [response.conversation_id]: latestMessages,
            }));
            await refreshConversations(token, response.conversation_id);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send message.");
            setDraft(content);
        } finally {
            setSending(false);
        }
    }

    return (
        <main className="relative flex-1 overflow-x-hidden bg-background px-3 py-4">
            <DoodleBackdrop />

            <div className="relative z-10 mx-auto flex h-[calc(100vh-8rem)] min-h-155 max-w-6xl flex-col overflow-hidden sketch-border-thick shadow-[5px_5px_0_rgba(28,25,23,0.15)] md:flex-row">
                <aside className="hidden w-72 shrink-0 flex-col border-r-2 border-dashed border-ink/20 bg-mint/30 md:flex">
                    <div className="border-b-2 border-dashed border-ink/20 p-3">
                        <button
                            type="button"
                            onClick={handleNewConversation}
                            className="sketch-btn w-full px-3 py-2 text-lg"
                            disabled={!token}
                        >
                            <span aria-hidden="true" className="mr-1">+</span>
                            New Chat
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-2">
                        {loadingConversations ? (
                            <div className="flex h-24 items-center justify-center">
                                <PlaneDoodle className="h-8 w-8 wobble text-ink/60" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <p className="px-3 py-4 text-center font-hand text-lg text-ink/60">
                                No conversations yet ~
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {conversations.map((conversation) => {
                                    const active = conversation.id === activeConversationId;
                                    const editing = conversation.id === editingConversationId;
                                    const label = getConversationLabel(
                                        conversation,
                                        messagesByConversation
                                    );

                                    if (editing) {
                                        return (
                                            <div
                                                key={conversation.id}
                                                className="sketch-border rotate-1 p-2"
                                            >
                                                <label
                                                    htmlFor={`conversation-title-${conversation.id}`}
                                                    className="sr-only"
                                                >
                                                    Conversation title
                                                </label>
                                                <input
                                                    id={`conversation-title-${conversation.id}`}
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            void handleRenameConversation(conversation.id);
                                                        }
                                                        if (e.key === "Escape") {
                                                            cancelRenaming();
                                                        }
                                                    }}
                                                    maxLength={100}
                                                    autoFocus
                                                    className="h-9 w-full bg-transparent px-2 text-sm text-ink outline-none"
                                                />
                                                <div className="mt-2 flex justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={cancelRenaming}
                                                        className="flex h-8 w-8 items-center justify-center text-ink/50 transition-colors hover:text-ink"
                                                        aria-label="Cancel rename"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                            className="h-4 w-4"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="m12 10.59 5.3-5.3 1.4 1.42-5.29 5.29 5.3 5.3-1.42 1.4-5.29-5.29-5.3 5.3-1.4-1.42 5.29-5.29-5.3-5.3 1.42-1.4 5.29 5.29Z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRenameConversation(conversation.id)}
                                                        disabled={savingTitle}
                                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-sky text-white transition-transform hover:-rotate-6 disabled:cursor-not-allowed disabled:opacity-50"
                                                        aria-label="Save conversation title"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                            className="h-4 w-4"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="m9 16.17-3.59-3.58L4 14l5 5L20 8l-1.41-1.41L9 16.17Z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={conversation.id}
                                            className={`group flex items-center gap-1 rounded-lg pr-1 transition-transform ${active
                                                ? "sketch-border -rotate-1 bg-sun/50"
                                                : "hover:-rotate-1 hover:bg-paper/80"
                                                }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handleSelectConversation(conversation.id)}
                                                className="min-w-0 flex-1 px-3 py-2 text-left"
                                            >
                                                <span className={`block truncate text-sm font-semibold ${active ? "text-ink" : "text-ink/80"}`}>
                                                    {label}
                                                </span>
                                                <span className="mt-1 block text-xs text-ink/45">
                                                    {formatConversationDate(conversation.created_at)}
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => startRenaming(conversation)}
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink/40 opacity-100 transition-colors hover:bg-sky/30 hover:text-ink md:opacity-0 md:group-hover:opacity-100"
                                                aria-label="Rename conversation"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M4 17.46V20h2.54L17.06 9.48l-2.54-2.54L4 17.46ZM19.04 7.5a1 1 0 0 0 0-1.41l-1.13-1.13a1 1 0 0 0-1.41 0l-.9.9 2.54 2.54.9-.9Z" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteConversation(conversation, label)}
                                                disabled={deletingConversationId === conversation.id}
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink/40 opacity-100 transition-colors hover:bg-blush/70 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 md:opacity-0 md:group-hover:opacity-100"
                                                aria-label="Delete conversation"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-.8 11a2 2 0 0 1-2 2H8.8a2 2 0 0 1-2-2L6 9Zm3 2v8h2v-8H9Zm4 0v8h2v-8h-2Z" />
                                                </svg>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </aside>

                <section className="flex min-w-0 flex-1 flex-col">
                    <div className="flex min-h-14 items-center justify-between border-b-2 border-dashed border-ink/20 px-4">
                        <div className="min-w-0">
                            <h1 className="truncate font-hand text-2xl font-bold text-ink">
                                {activeConversationLabel}
                            </h1>
                            <p className="font-hand text-base text-ink/60">
                                KelanaAI Travel Assistant
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleNewConversation}
                            className="sketch-btn px-3 py-1.5 text-base md:hidden"
                            disabled={!token}
                        >
                            New
                        </button>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="border-b-2 border-dashed border-ink/20 bg-blush/60 px-4 py-3 text-center text-sm font-semibold text-ink"
                        >
                            {error}
                        </div>
                    )}

                    <div className="min-h-0 flex-1 overflow-y-auto bg-paper/60 px-4 py-5">
                        {loadingMessages ? (
                            <div className="flex h-full items-center justify-center">
                                <PlaneDoodle className="h-10 w-10 wobble text-ink/60" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-center">
                                <div className="relative max-w-sm">
                                    <Star className="absolute -left-6 -top-4 h-5 w-5 text-sun float-doodle" />
                                    <Heart className="absolute -right-5 top-2 h-5 w-5 text-blush float-doodle" />
                                    <h2 className="font-hand text-3xl font-bold text-ink -rotate-1">
                                        Where should we go next?
                                    </h2>
                                    <p className="mt-3 rotate-1 font-hand text-xl leading-snug text-ink/60">
                                        Ask about routes, itineraries, budgets, or what to do on a specific day.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mx-auto flex max-w-3xl flex-col gap-4">
                                {messages.map((message) => {
                                    const isUser = message.role === "user";
                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`sketch-border max-w-[78%] px-4 py-3 text-sm leading-6 ${isUser
                                                    ? "-rotate-1 bg-sun/60 text-ink"
                                                    : "rotate-1 bg-paper text-ink/90"
                                                    } ${"pending" in message && message.pending ? "opacity-70" : ""}`}
                                            >
                                                {isUser ? (
                                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                                ) : (
                                                    <div className="prose prose-sm max-w-none text-inherit prose-p:my-0 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {sending && (
                                    <div className="flex justify-start">
                                        <div className="sketch-border rotate-1 px-4 py-3 text-sm text-ink/60">
                                            <span className="flex items-center gap-2">
                                                <PlaneDoodle className="h-5 w-5 wobble text-ink/60" />
                                                scribbling...
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="border-t-2 border-dashed border-ink/20 bg-paper p-3"
                    >
                        <div className="mx-auto flex max-w-3xl items-end gap-2 sketch-border bg-paper p-2">
                            <label htmlFor="chat-message" className="sr-only">
                                Message
                            </label>
                            <textarea
                                id="chat-message"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        e.currentTarget.form?.requestSubmit();
                                    }
                                }}
                                rows={1}
                                placeholder="Type a message..."
                                className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-ink outline-none placeholder:text-ink/35"
                            />
                            <button
                                type="submit"
                                disabled={!canSend}
                                aria-label="Send message"
                                className="sketch-btn flex h-10 w-10 shrink-0 items-center justify-center p-0"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                >
                                    <path d="M3.48 20.52 22 12 3.48 3.48 3 10.1l10 1.9-10 1.9.48 6.62Z" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}
