"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Logo } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { formatINR, formatSqft } from "@/lib/format";
import type { BuilderProfile } from "@/types";

function BuilderProfileInner() {
  const params = useParams();
  const search = useSearchParams();
  const id = Number(params.id);
  const projectId = search.get("project");
  const { toast } = useToast();
  const [builder, setBuilder] = useState<BuilderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<BuilderProfile>(`/api/builders/${id}`);
        setBuilder(data);
      } catch {
        toast("Unable to load builder profile. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-16">
        <div className="skeleton h-64 w-full rounded-[2rem]" />
      </div>
    );
  }

  if (!builder) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Builder not found</h1>
        <Link href="/customer/dashboard" className="mt-6 inline-block">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <header className="border-b border-ink-100 bg-white pt-safe">
        <div className="page-container page-pad flex h-14 max-w-5xl items-center justify-between sm:h-16">
          <Logo />
          <Link href="/customer/dashboard" className="text-sm text-ink-500">
            Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl page-pad py-6 pb-safe sm:py-10">
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft sm:rounded-[2rem]">
          <div className="relative h-40 bg-ink-200 sm:h-48 md:h-64">
            {builder.portfolio[0]?.images[0] && (
              <Image
                src={builder.portfolio[0].images[0]}
                alt=""
                fill
                className="object-cover"
                sizes="1000px"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white sm:bottom-6 sm:left-6 sm:right-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="heading-page break-words font-display md:text-4xl">
                    {builder.company_name}
                  </h1>
                  <p className="mt-1 text-xs text-white/80 sm:text-sm">
                    {builder.city}
                    {builder.office_address ? ` · ${builder.office_address}` : ""}{" "}
                    · {builder.years_experience} years experience
                  </p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
                  {builder.verification_status === "VERIFIED"
                    ? "Verified"
                    : "Verification pending"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-4 sm:gap-10 sm:p-6 md:grid-cols-[1.4fr_1fr] md:p-10">
            <div>
              <h2 className="font-display text-xl text-ink-900 sm:text-2xl">About</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                {builder.description || "No description provided."}
              </p>

              <h2 className="mt-8 font-display text-xl text-ink-900 sm:mt-10 sm:text-2xl">
                Specializations
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {builder.project_types.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-ink-200 px-3 py-1 text-sm text-ink-700"
                  >
                    {t}
                  </span>
                ))}
                {builder.services.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-800"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <h2 className="mt-8 font-display text-xl text-ink-900 sm:mt-10 sm:text-2xl">
                Portfolio
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-6">
                {builder.portfolio.map((p) => (
                  <article
                    key={p.id}
                    className="overflow-hidden rounded-2xl border border-ink-100"
                  >
                    <div className="relative h-40 bg-ink-100 sm:h-44">
                      {p.images[0] && (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="(max-width:640px) 100vw, 400px"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-ink-900">{p.name}</h3>
                      <p className="mt-1 text-sm text-ink-500">
                        {p.location} · {p.project_type}
                      </p>
                      <p className="mt-1 text-sm text-ink-600">
                        {formatSqft(p.built_up_area)} ·{" "}
                        {p.project_cost ? formatINR(p.project_cost) : "—"} ·{" "}
                        {p.completion_year || "—"}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-ink-100 bg-[#fafaf8] p-5 sm:rounded-3xl sm:p-6 md:sticky md:top-20">
              <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">
                Pricing
              </p>
              <p className="mt-2 font-display text-xl text-ink-900 sm:text-2xl">
                {builder.min_price_per_sqft && builder.max_price_per_sqft
                  ? `₹${builder.min_price_per_sqft.toLocaleString("en-IN")} – ₹${builder.max_price_per_sqft.toLocaleString("en-IN")} / sq ft`
                  : "On request"}
              </p>
              <dl className="mt-6 space-y-3 text-sm">
                <Row
                  label="Projects completed"
                  value={String(builder.projects_completed)}
                />
                <Row
                  label="Team size"
                  value={builder.team_size ? String(builder.team_size) : "—"}
                />
                <Row
                  label="Min project value"
                  value={
                    builder.min_project_value
                      ? formatINR(builder.min_project_value)
                      : "—"
                  }
                />
                <Row
                  label="Max project value"
                  value={
                    builder.max_project_value
                      ? formatINR(builder.max_project_value)
                      : "—"
                  }
                />
                <Row
                  label="Areas served"
                  value={builder.service_areas.join(", ") || "—"}
                />
              </dl>
              <Button
                className="mt-8 w-full"
                onClick={() =>
                  toast(
                    projectId
                      ? "This builder can now see your open project and submit a quotation."
                      : "Create or open a project, then request a quote from your dashboard.",
                    "success"
                  )
                }
              >
                Request a Quote
              </Button>
              {projectId && (
                <Link
                  href={`/customer/projects/${projectId}/quotes`}
                  className="mt-3 block"
                >
                  <Button variant="outline" className="w-full">
                    View my quotations
                  </Button>
                </Link>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-ink-100 pb-2">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-right font-medium text-ink-900">{value}</dd>
    </div>
  );
}

export default function BuilderPublicPage() {
  return (
    <Suspense>
      <BuilderProfileInner />
    </Suspense>
  );
}
