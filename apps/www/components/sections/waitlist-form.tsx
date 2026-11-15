"use client";

import { ArrowRight, Check } from "lucide-react";
import { useActionState } from "react";

import type { HomeMessages } from "@/content/messages";
import { joinWaitlist, type WaitlistState } from "@/server/join-waitlist";

export function WaitlistForm({ t }: { t: HomeMessages["waitlist"]["form"] }) {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, {
    status: "idle",
  });

  if (state.status === "joined") {
    return (
      <p className="t-body flex h-14 items-center gap-2">
        <Check className="size-4" />
        {t.joined}
      </p>
    );
  }

  return (
    <form action={action} className="w-full max-w-md">
      <div className="flex h-14 items-center gap-2 rounded-full bg-background/10 p-1.5 pl-5 ring-1 ring-background/15 focus-within:ring-background/40">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          aria-label={t.email}
          className="t-body min-w-0 flex-1 bg-transparent text-background outline-none placeholder:text-background/45"
        />
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <button
          type="submit"
          disabled={pending}
          className="btn h-full shrink-0 rounded-full bg-background text-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? t.joining : t.join} <ArrowRight className="size-3.5" />
        </button>
      </div>
      {state.status !== "idle" && (
        <p role="alert" className="t-small mt-3 text-background/70">
          {t[state.status]}
        </p>
      )}
    </form>
  );
}
