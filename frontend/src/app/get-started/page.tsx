"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";

function RoleCards() {
  const params = useSearchParams();
  const hint = params.get("role");

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
      <div
        className={`group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card sm:rounded-[2rem] sm:p-8 ${
          hint === "customer"
            ? "border-brand-400 ring-2 ring-brand-100"
            : "border-ink-100"
        }`}
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-50 transition group-hover:scale-150" />
        <p className="relative text-xs font-medium tracking-wide text-brand-600 uppercase sm:text-sm">
          Homeowner
        </p>
        <h2 className="relative mt-3 font-display text-2xl text-ink-900 sm:text-3xl">
          I want to build a home
        </h2>
        <p className="relative mt-3 text-sm leading-relaxed text-ink-500">
          For homeowners looking for construction companies.
        </p>
        <Link
          href="/signup?role=customer"
          className="relative mt-6 block sm:mt-8 sm:inline-block"
        >
          <Button size="lg" className="w-full sm:w-auto">
            Continue as Homeowner
          </Button>
        </Link>
      </div>

      <div
        className={`group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card sm:rounded-[2rem] sm:p-8 ${
          hint === "builder"
            ? "border-brand-400 ring-2 ring-brand-100"
            : "border-ink-100"
        }`}
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-ink-50 transition group-hover:scale-150" />
        <p className="relative text-xs font-medium tracking-wide text-ink-500 uppercase sm:text-sm">
          Construction company
        </p>
        <h2 className="relative mt-3 font-display text-2xl text-ink-900 sm:text-3xl">
          I&apos;m a builder
        </h2>
        <p className="relative mt-3 text-sm leading-relaxed text-ink-500">
          For construction companies looking for new projects.
        </p>
        <Link
          href="/signup?role=builder"
          className="relative mt-6 block sm:mt-8 sm:inline-block"
        >
          <Button size="lg" variant="secondary" className="w-full sm:w-auto">
            Continue as Builder
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_#eef8f6_0%,_#f7f6f3_45%,_#f7f6f3_100%)]">
      <div className="page-container page-pad py-8 pb-safe sm:py-10">
        <Logo />
        <div className="mt-10 max-w-2xl sm:mt-16">
          <h1 className="heading-section font-display text-ink-900">
            What brings you to BuilderOne?
          </h1>
          <p className="mt-3 text-sm text-ink-500 sm:mt-4 sm:text-base">
            BuilderOne is a marketplace that connects homeowners with
            construction companies across Bengaluru.
          </p>
        </div>
        <div className="mt-8 sm:mt-12">
          <Suspense
            fallback={<div className="skeleton h-64 w-full rounded-2xl" />}
          >
            <RoleCards />
          </Suspense>
        </div>
        <p className="mt-10 pb-8 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
