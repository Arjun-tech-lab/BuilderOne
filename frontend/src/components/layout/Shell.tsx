"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/format";

export function Logo({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex min-h-11 items-center gap-2", className)}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
        B1
      </span>
      <span
        className={cn(
          "font-display text-lg tracking-tight sm:text-xl",
          light ? "text-white" : "text-ink-900"
        )}
      >
        BuilderOne
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const dashHref =
    user?.role === "BUILDER" ? "/builder/dashboard" : "/customer/dashboard";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 pt-safe transition-all",
        scrolled || open
          ? "border-b border-ink-100 bg-white/95 backdrop-blur-md"
          : "border-b border-transparent bg-ink-900/25 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
      )}
    >
      <div className="page-container page-pad flex h-14 items-center justify-between sm:h-16">
        <Logo light={!scrolled && !open} />
        <nav className="hidden items-center gap-6 text-sm lg:flex xl:gap-8">
          <a
            href="/#how-it-works"
            className={cn(
              scrolled || open
                ? "text-ink-600 hover:text-ink-900"
                : "text-white/90 hover:text-white"
            )}
          >
            How it works
          </a>
          <a
            href="/#for-homeowners"
            className={cn(
              scrolled || open
                ? "text-ink-600 hover:text-ink-900"
                : "text-white/90 hover:text-white"
            )}
          >
            For Homeowners
          </a>
          <a
            href="/#for-builders"
            className={cn(
              scrolled || open
                ? "text-ink-600 hover:text-ink-900"
                : "text-white/90 hover:text-white"
            )}
          >
            For Builders
          </a>
          {user ? (
            <>
              <Link
                href={dashHref}
                className={cn(
                  scrolled || open
                    ? "text-ink-600 hover:text-ink-900"
                    : "text-white/90 hover:text-white"
                )}
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className={cn(
                  scrolled || open
                    ? "text-ink-600 hover:text-ink-900"
                    : "text-white/90 hover:text-white"
                )}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={cn(
                scrolled || open
                  ? "text-ink-600 hover:text-ink-900"
                  : "text-white/90 hover:text-white"
              )}
            >
              Login
            </Link>
          )}
        </nav>
        <div className="hidden lg:block">
          <Link href="/get-started">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
        <button
          type="button"
          className={cn(
            "touch-target flex flex-col items-center justify-center rounded-xl lg:hidden",
            scrolled || open ? "text-ink-800" : "text-white"
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span
            className={cn(
              "block h-0.5 w-5 bg-current transition",
              open && "translate-y-2 rotate-45"
            )}
          />
          <span
            className={cn(
              "mt-1.5 block h-0.5 w-5 bg-current transition",
              open && "opacity-0"
            )}
          />
          <span
            className={cn(
              "mt-1.5 block h-0.5 w-5 bg-current transition",
              open && "-translate-y-2 -rotate-45"
            )}
          />
        </button>
      </div>
      {open && (
        <div className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-ink-100 bg-white px-4 py-4 pb-safe lg:hidden sm:px-5">
          <div className="flex flex-col gap-1 text-base text-ink-700">
            {[
              { href: "/#how-it-works", label: "How it works" },
              { href: "/#for-homeowners", label: "For Homeowners" },
              { href: "/#for-builders", label: "For Builders" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-3 hover:bg-ink-50"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            {user ? (
              <>
                <Link
                  href={dashHref}
                  className="rounded-xl px-3 py-3 hover:bg-ink-50"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="rounded-xl px-3 py-3 text-left hover:bg-ink-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-xl px-3 py-3 hover:bg-ink-50"
              >
                Login
              </Link>
            )}
            <Link href="/get-started" className="mt-2 block">
              <Button className="w-full" size="lg">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/** Compact top bar for authenticated app screens */
export function AppHeader({
  links = [],
}: {
  links?: { href: string; label: string }[];
}) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 pt-safe backdrop-blur-md">
      <div className="page-container page-pad flex h-14 items-center justify-between gap-3 sm:h-16">
        <Logo />
        <nav className="hidden items-center gap-4 text-sm md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-2 py-1.5 text-ink-600 hover:text-ink-900",
                pathname.startsWith(l.href) && "font-medium text-brand-700"
              )}
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => logout()}
            className="text-ink-500 hover:text-ink-800"
          >
            Logout
          </button>
        </nav>
        <button
          type="button"
          className="touch-target flex flex-col items-center justify-center gap-1.5 rounded-xl text-ink-800 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
        </button>
      </div>
      {open && (
        <div className="border-t border-ink-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-xl px-3 py-3 text-ink-700 hover:bg-ink-50"
              >
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-xl px-3 py-3 text-left text-ink-500 hover:bg-ink-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export function ProgressSteps({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium text-ink-500">
        <span>
          Step {current + 1} of {steps.length}
        </span>
        <span className="truncate text-right">{steps[current]}</span>
      </div>
      <div className="flex gap-1 sm:gap-1.5">
        {steps.map((label, i) => (
          <div
            key={label}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= current ? "bg-brand-600" : "bg-ink-100"
            )}
            title={label}
          />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-white px-4 py-12 text-center sm:rounded-3xl sm:px-6 sm:py-16">
      <h3 className="heading-page font-display text-ink-900">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">{description}</p>
      )}
      {action && (
        <div className="mt-6 flex justify-center [&>a]:w-full [&>a]:sm:w-auto [&_button]:w-full [&_button]:sm:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-5">
      <div className="skeleton mb-4 h-36 w-full sm:h-40" />
      <div className="skeleton mb-2 h-5 w-2/3" />
      <div className="skeleton h-4 w-1/2" />
    </div>
  );
}
