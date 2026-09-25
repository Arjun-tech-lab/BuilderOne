"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader, EmptyState, SkeletonCard } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { formatBudgetRange, formatSqft } from "@/lib/format";
import type { BuilderProfile, ConstructionProject } from "@/types";

export default function BuilderDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<BuilderProfile | null>(null);
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "BUILDER")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== "BUILDER") return;
    (async () => {
      try {
        const [p, rec] = await Promise.all([
          api<BuilderProfile>("/api/builders/profile"),
          api<ConstructionProject[]>("/api/builders/projects/recommended"),
        ]);
        setProfile(p);
        setProjects(rec);
      } catch {
        toast("Unable to load dashboard. Please try again.", "error");
      } finally {
        setBusy(false);
      }
    })();
  }, [user, toast]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="skeleton h-10 w-48" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#f7f6f3] pb-safe">
      <AppHeader
        links={[
          { href: "/builder/projects", label: "Projects" },
          { href: "/builder/onboarding", label: "Edit profile" },
          { href: "/builder/dashboard", label: "Dashboard" },
        ]}
      />

      <main className="page-container page-pad py-6 sm:py-8 md:py-10">
        <h1 className="heading-page font-display text-ink-900">
          Welcome, {profile?.company_name || user.name}
        </h1>
        <p className="mt-2 text-sm text-ink-500 sm:text-base">
          Discover projects that match your services and service areas.
        </p>

        {busy ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:mt-8 sm:rounded-3xl sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">
                    Profile completion
                  </p>
                  <p className="mt-1 font-display text-2xl text-ink-900 sm:text-3xl">
                    {profile?.profile_completion ?? 0}% complete
                  </p>
                </div>
                <span className="rounded-full bg-ink-50 px-3 py-1 text-xs text-ink-600">
                  Verification: {profile?.verification_status || "PENDING"}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all"
                  style={{ width: `${profile?.profile_completion ?? 0}%` }}
                />
              </div>
              {profile?.missing_fields && profile.missing_fields.length > 0 && (
                <p className="mt-3 text-sm text-ink-500">
                  Missing: {profile.missing_fields.join(", ")}
                </p>
              )}
              <Link href="/builder/onboarding" className="mt-4 inline-block w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Complete profile
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-end justify-between gap-3 sm:mt-12">
              <h2 className="font-display text-xl text-ink-900 sm:text-2xl">
                Recommended projects
              </h2>
              <Link
                href="/builder/projects"
                className="shrink-0 text-sm text-brand-700"
              >
                View all
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="No matching projects yet."
                  description="Complete your profile and we'll show you relevant opportunities."
                  action={
                    <Link href="/builder/onboarding">
                      <Button>Complete your profile</Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {projects.slice(0, 6).map((p) => (
                  <article
                    key={p.id}
                    className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-5"
                  >
                    <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">
                      Project opportunity
                    </p>
                    <h3 className="mt-2 break-words font-display text-lg text-ink-900 sm:text-xl">
                      {p.location}, {p.city}
                    </h3>
                    <p className="mt-2 text-sm text-ink-600">
                      {p.property_type}
                      <br />
                      {formatSqft(p.built_up_area)} · {p.floors}
                    </p>
                    <p className="mt-3 text-sm">
                      <span className="text-ink-400">Budget: </span>
                      {formatBudgetRange(p.budget_min, p.budget_max)}
                    </p>
                    <p className="text-sm">
                      <span className="text-ink-400">Timeline: </span>
                      {p.timeline}
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-semibold text-brand-700">
                        {p.match_score ?? "—"}% Match
                      </span>
                      <Link href={`/builder/projects/${p.id}`} className="w-full sm:w-auto">
                        <Button size="sm" className="w-full sm:w-auto">
                          View Project
                        </Button>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
