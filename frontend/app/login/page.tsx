"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/services/authService";
import {
    DoodleBackdrop,
    Heart,
    PlaneDoodle,
    Squiggle,
    Star,
} from "@/components/Doodles";

type Mode = "login" | "register";

interface FormState {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FieldErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

function validate(form: FormState, mode: Mode): FieldErrors {
    const errors: FieldErrors = {};

    if (mode === "register") {
        if (!form.name.trim()) {
            errors.name = "Name is required.";
        } else if (form.name.trim().length < 2) {
            errors.name = "Name must be at least 2 characters.";
        }
    }

    if (!form.email.trim()) {
        errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = "Enter a valid email address.";
    }

    if (!form.password) {
        errors.password = "Password is required.";
    } else if (form.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    }

    if (mode === "register") {
        if (!form.confirmPassword) {
            errors.confirmPassword = "Please confirm your password.";
        } else if (form.password !== form.confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }
    }

    return errors;
}

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("login");
    const [form, setForm] = useState<FormState>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [serverError, setServerError] = useState<string | null>(null);

    const [pending, setPending] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // clear the field error as the user types
        if (fieldErrors[name as keyof FieldErrors]) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    }

    function switchMode(next: Mode) {
        setMode(next);
        setFieldErrors({});
        setServerError(null);
        setShowPassword(false);
        setShowConfirm(false);
    }

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setServerError(null);

        const errors = validate(form, mode);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setPending(true);
        try {
            if (mode === "login") {
                const { access_token } = await login(form.email, form.password);
                localStorage.setItem("access_token", access_token);
                router.push("/trips");
            } else {
                await register(form.name, form.email, form.password);
                const { access_token } = await login(form.email, form.password);
                localStorage.setItem("access_token", access_token);
                router.push("/trips");
            }
        } catch (err) {
            setServerError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setPending(false);
        }
    }

    return (
        <main className="relative flex flex-1 flex-col items-center justify-center overflow-x-hidden bg-background px-4 py-10">
            <DoodleBackdrop />

            {/* Header */}
            <div className="relative z-10 mb-8 flex flex-col items-center gap-1 text-center">
                <Star className="absolute -left-8 top-0 h-6 w-6 text-sun float-doodle" />
                <Heart className="absolute -right-8 top-2 h-5 w-5 text-blush float-doodle" />
                <h2 className="font-hand text-4xl font-bold leading-none text-ink -rotate-1 sm:text-5xl">
                    {mode === "login" ? (
                        <>Your next adventure <span className="text-sky">awaits.</span></>
                    ) : (
                        <>The world is yours to <span className="text-sky">explore.</span></>
                    )}
                </h2>
                <p className="mt-2 rotate-1 font-hand text-xl text-ink/60">
                    {mode === "login"
                        ? "Sign in and pick up where you left off ~"
                        : "Create an account to start planning ~"}
                </p>
                <Squiggle className="mt-2 h-3 w-28 text-sky" />
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                noValidate
                className="relative z-10 flex w-full max-w-lg flex-col gap-4"
            >
                {/* Name — register only */}
                {mode === "register" && (
                    <div className="flex flex-col gap-1">
                        <div className="sketch-border flex -rotate-1 flex-col gap-1 px-5 py-3.5">
                            <label
                                htmlFor="name"
                                className="font-hand text-lg font-semibold text-ink/70"
                            >
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="e.g. Jane Doe"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                                className="bg-transparent text-base text-ink placeholder:text-ink/35 outline-none"
                            />
                        </div>
                        {fieldErrors.name && (
                            <p className="px-1 text-xs font-semibold text-red-500">{fieldErrors.name}</p>
                        )}
                    </div>
                )}

                {/* Email */}
                <div className="flex flex-col gap-1">
                    <div className="sketch-border flex rotate-1 flex-col gap-1 px-5 py-3.5">
                        <label
                            htmlFor="email"
                            className="font-hand text-lg font-semibold text-ink/70"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            className="bg-transparent text-base text-ink placeholder:text-ink/35 outline-none"
                        />
                    </div>
                    {fieldErrors.email && (
                        <p className="px-1 text-xs font-semibold text-red-500">{fieldErrors.email}</p>
                    )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                    <div className="sketch-border flex -rotate-1 flex-col gap-1 px-5 py-3.5">
                        <label
                            htmlFor="password"
                            className="font-hand text-lg font-semibold text-ink/70"
                        >
                            Password
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Min. 8 characters"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete={mode === "login" ? "current-password" : "new-password"}
                                className="flex-1 bg-transparent text-base text-ink placeholder:text-ink/35 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="text-ink/40 hover:text-sky transition-colors duration-150 cursor-pointer"
                            >
                                {showPassword ? (
                                    // Eye-off
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                                        <path d="M2.22 2.22a.75.75 0 0 0 0 1.06l1.56 1.56C2.27 6.18 1 8.32 1 12c0 5 4.48 9 10 9a11.1 11.1 0 0 0 6.16-1.84l1.62 1.62a.75.75 0 1 0 1.06-1.06l-18-18a.75.75 0 0 0-1.06 0ZM12 19c-4.41 0-8-3.36-8-7 0-2.48.97-4.35 2.54-5.69L8.3 8.07A5 5 0 0 0 12 17a4.98 4.98 0 0 0 3.47-1.41l1.28 1.28A9.58 9.58 0 0 1 12 19Zm7.46-3.27-1.43-1.43A7.8 7.8 0 0 0 20 12c0-3.64-3.59-7-8-7a9.5 9.5 0 0 0-2.85.44L7.62 3.91A10.9 10.9 0 0 1 12 3c5.52 0 10 4 10 9a9.84 9.84 0 0 1-2.54 6.73ZM12 7a5 5 0 0 1 4.47 7.24l-6.7-6.7A4.97 4.97 0 0 1 12 7Z" />
                                    </svg>
                                ) : (
                                    // Eye
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                                        <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    {fieldErrors.password && (
                        <p className="px-1 text-xs font-semibold text-red-500">{fieldErrors.password}</p>
                    )}
                </div>

                {/* Confirm password — register only */}
                {mode === "register" && (
                    <div className="flex flex-col gap-1">
                        <div className="sketch-border flex rotate-1 flex-col gap-1 px-5 py-3.5">
                            <label
                                htmlFor="confirmPassword"
                                className="font-hand text-lg font-semibold text-ink/70"
                            >
                                Confirm Password
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Repeat your password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    className="flex-1 bg-transparent text-base text-ink placeholder:text-ink/35 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    aria-label={showConfirm ? "Hide password" : "Show password"}
                                    className="text-ink/40 hover:text-sky transition-colors duration-150 cursor-pointer"
                                >
                                    {showConfirm ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                                            <path d="M2.22 2.22a.75.75 0 0 0 0 1.06l1.56 1.56C2.27 6.18 1 8.32 1 12c0 5 4.48 9 10 9a11.1 11.1 0 0 0 6.16-1.84l1.62 1.62a.75.75 0 1 0 1.06-1.06l-18-18a.75.75 0 0 0-1.06 0ZM12 19c-4.41 0-8-3.36-8-7 0-2.48.97-4.35 2.54-5.69L8.3 8.07A5 5 0 0 0 12 17a4.98 4.98 0 0 0 3.47-1.41l1.28 1.28A9.58 9.58 0 0 1 12 19Zm7.46-3.27-1.43-1.43A7.8 7.8 0 0 0 20 12c0-3.64-3.59-7-8-7a9.5 9.5 0 0 0-2.85.44L7.62 3.91A10.9 10.9 0 0 1 12 3c5.52 0 10 4 10 9a9.84 9.84 0 0 1-2.54 6.73ZM12 7a5 5 0 0 1 4.47 7.24l-6.7-6.7A4.97 4.97 0 0 1 12 7Z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                                            <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        {fieldErrors.confirmPassword && (
                            <p className="px-1 text-xs font-semibold text-red-500">
                                {fieldErrors.confirmPassword}
                            </p>
                        )}
                    </div>
                )}

                {/* Server error */}
                {serverError && (
                    <div
                        role="alert"
                        className="sketch-border rotate-1 bg-blush/60 px-5 py-4 text-center text-sm font-semibold text-ink"
                    >
                        <span className="font-hand text-lg">oops!</span>
                        <br />
                        {serverError}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={pending}
                    className="mt-2 flex w-full items-center justify-center gap-2 sketch-btn px-4 py-3 text-2xl"
                >
                    {pending ? (
                        <>
                            <PlaneDoodle className="h-5 w-5 wobble text-ink" />
                            {mode === "login" ? "Signing in…" : "Creating account…"}
                        </>
                    ) : mode === "login" ? (
                        "Sign In"
                    ) : (
                        "Create Account"
                    )}
                </button>

                {/* Toggle mode */}
                <p className="mt-1 text-center font-hand text-lg text-ink/60">
                    {mode === "login" ? (
                        <>
                            Don&apos;t have an account?{" "}
                            <button
                                type="button"
                                onClick={() => switchMode("register")}
                                className="font-semibold text-sky underline decoration-wavy underline-offset-4 hover:text-ink"
                            >
                                Register
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => switchMode("login")}
                                className="font-semibold text-sky underline decoration-wavy underline-offset-4 hover:text-ink"
                            >
                                Sign In
                            </button>
                        </>
                    )}
                </p>
            </form>
        </main>
    );
}
