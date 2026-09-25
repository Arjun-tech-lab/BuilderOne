"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppHeader, EmptyState, SkeletonCard } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
  formatBudgetRange,
  formatINR,
  formatSqft,
  greetingForNow,
  projectStatusLabel,
} from "@/lib/format";
import type { BuilderProfile, ConstructionProject } from "@/types";

function DashboardInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [builders, setBuilders] = useState<BuilderProfile[]>([]);
  const [busy, setBusy] = useState(true);
  const [requesting, setRequesting] = useState<number | null>(null);

  const focusId = params.get("project");

  useEffect(() => {
    if (!loading && (!user || user.role !== "CUSTOMER")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== "CUSTOMER") return;
    (async () => {
      try {
        const qs = focusId ? `?project_id=${focusId}` : "";
        const data = await api<{
          projects: ConstructionProject[];
          active_project_id: number | null;
          recommended_builders: BuilderProfile[];
        }>(`/api/customer/dashboard${qs}`);
        setProjects(data.projects);
        setBuilders(data.recommended_builders);
      } catch {
        toast("Unable to load your dashboard. Please try again.", "error");
      } finally {
        setBusy(false);
      }
    })();
  }, [user, focusId, toast]);

  const project = projects.find((p) => String(p.id) === focusId) || projects[0];

  async function requestQuote(builderId: number) {
    if (!project) return;
    setRequesting(builderId);
    try {
      toast(
        "Open the builder profile to review, then they can submit a quote.",
        "info"
      );
      router.push(`/builders/${builderId}?project=${project.id}`);
    } finally {
      setRequesting(null);
    }
  }

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
          { href: "/customer/onboarding", label: "New project" },
          { href: "/customer/dashboard", label: "Dashboard" },
        ]}
      />

      <main className="page-container page-pad py-6 sm:py-8 md:py-10">
        <h1 className="heading-page font-display text-ink-900">
          {greetingForNow()}, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-2 text-sm text-ink-500 sm:text-base">
          Let&apos;s find the right builder for your project.
        </p>

        {busy ? (
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : !project ? (
          <div className="mt-8 sm:mt-10">
            <EmptyState
              title="Your home project starts here."
              description="Tell us what you want to build and we'll match you with relevant construction companies."
              action={
                <Link href="/customer/onboarding">
                  <Button>Create your project</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:mt-10 sm:rounded-3xl sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">
                    Your project
                  </p>
                  <h2 className="mt-1 break-words font-display text-xl text-ink-900 sm:text-2xl">
                    {project.location}, {project.city}
                  </h2>
                </div>
                <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
                  {projectStatusLabel(project.status)}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-5">
                <Meta label="Property" value={project.property_type} />
                <Meta label="Built-up" value={formatSqft(project.built_up_area)} />
                <Meta
                  label="Budget"
                  value={formatBudgetRange(project.budget_min, project.budget_max)}
                />
                <Meta label="Timeline" value={project.timeline || "—"} />
                <Meta label="Floors" value={project.floors || "—"} />
              </div>
              <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3">
                <Link
                  href={`/customer/projects/${project.id}/quotes`}
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full sm:w-auto">Compare quotations</Button>
                </Link>
                <Link href="/customer/onboarding" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Create another project
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-8 sm:mt-12">
              <h2 className="font-display text-xl text-ink-900 sm:text-2xl">
                Recommended builders
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Matched to your locality, budget, and requirements.
              </p>
            </div>

            {builders.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="No matching builders yet."
                  description="Try adjusting your project details or check back soon."
                />
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {builders.map((b) => (
                  <article
                    key={b.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft sm:rounded-3xl"
                  >
                    <div className="relative h-36 bg-ink-100 sm:h-40">
                      {b.logo_url ? (
                        <Image
                          src={b.logo_url}
                          alt={b.company_name}
                          fill
                          className="object-cover"
                          sizes="(max-width:640px) 100vw, 400px"
                        />
                      ) : null}
                      <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-700">
                        {b.match_score ?? "—"}% Match
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="min-w-0 flex-1 break-words font-semibold text-ink-900">
                          {b.company_name}
                        </h3>
                        <span className="shrink-0 rounded-full bg-ink-50 px-2 py-0.5 text-[10px] font-medium text-ink-500">
                          {b.verification_status === "VERIFIED"
                            ? "Verified"
                            : "Pending review"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink-500">
                        ★ {b.rating?.toFixed(1) ?? "—"} · {b.years_experience} yrs
                        · {b.projects_completed} projects
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-ink-600">
                        {b.service_areas.slice(0, 3).join(", ")}
                        {b.service_areas.length > 3 ? "…" : ""}
                      </p>
                      <p className="mt-1 text-sm font-medium text-ink-800">
                        {b.min_price_per_sqft && b.max_price_per_sqft
                          ? `${formatINR(b.min_price_per_sqft)} – ${formatINR(b.max_price_per_sqft)} / sq ft`
                          : "Pricing on request"}
                      </p>
                      <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:pt-5">
                        <Link href={`/builders/${b.id}`} className="flex-1">
                          <Button variant="outline" className="w-full" size="sm">
                            View Profile
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          className="flex-1"
                          loading={requesting === b.id}
                          onClick={() => requestQuote(b.id)}
                        >
                          Request Quote
                        </Button>
                      </div>
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

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-ink-400">{label}</p>
      <p className="mt-0.5 break-words text-sm font-medium text-ink-900">
        {value}
      </p>
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center">
          <div className="skeleton h-10 w-48" />
        </div>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}
