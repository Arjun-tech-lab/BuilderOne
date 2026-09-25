"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader, EmptyState } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";
import { formatINR } from "@/lib/format";
import type { Quote } from "@/types";

export default function QuoteComparisonPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [busy, setBusy] = useState(true);
  const [selected, setSelected] = useState<Quote | null>(null);
  const [shortlisting, setShortlisting] = useState<number | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "CUSTOMER") return;
    (async () => {
      try {
        const data = await api<Quote[]>(`/api/projects/${projectId}/quotes`);
        setQuotes(data);
      } catch {
        toast("Unable to load quotations. Please try again.", "error");
      } finally {
        setBusy(false);
      }
    })();
  }, [user, loading, projectId, toast]);

  async function shortlist(builderId: number) {
    setShortlisting(builderId);
    try {
      await api(`/api/projects/${projectId}/shortlist`, {
        method: "POST",
        body: JSON.stringify({ builder_id: builderId }),
      });
      setQuotes((prev) =>
        prev.map((q) =>
          q.builder_id === builderId ? { ...q, status: "SHORTLISTED" } : q
        )
      );
      toast("Builder shortlisted.", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Could not shortlist. Try again.",
        "error"
      );
    } finally {
      setShortlisting(null);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#f7f6f3] pb-safe">
      <AppHeader
        links={[
          { href: "/customer/dashboard", label: "Dashboard" },
          { href: `/customer/projects/${projectId}/quotes`, label: "Quotes" },
        ]}
      />

      <main className="page-container page-pad py-6 sm:py-8 md:py-10">
        <h1 className="heading-page font-display text-ink-900">
          Compare Builder Proposals
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">
          Review each proposal carefully. BuilderOne does not rank a “best”
          builder — you choose.
        </p>

        {busy ? (
          <div className="mt-8 skeleton h-48 rounded-2xl sm:h-64 sm:rounded-3xl" />
        ) : quotes.length === 0 ? (
          <div className="mt-8 sm:mt-10">
            <EmptyState
              title="No quotations yet."
              description="When builders submit proposals for your project, they'll appear here."
              action={
                <Link href="/customer/dashboard">
                  <Button>Browse recommended builders</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-6 hidden overflow-x-auto rounded-3xl border border-ink-100 bg-white shadow-soft lg:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-ink-50 text-xs tracking-wide text-ink-500 uppercase">
                  <tr>
                    <th className="px-5 py-4">Builder</th>
                    <th className="px-3 py-4">Match</th>
                    <th className="px-3 py-4">Cost</th>
                    <th className="px-3 py-4">Rate</th>
                    <th className="px-3 py-4">Timeline</th>
                    <th className="px-3 py-4">Package</th>
                    <th className="px-3 py-4">Warranty</th>
                    <th className="px-3 py-4">Experience</th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr key={q.id} className="border-t border-ink-100">
                      <td className="px-5 py-4 font-medium text-ink-900">
                        {q.builder_name}
                        {q.status === "SHORTLISTED" && (
                          <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] text-brand-700">
                            Shortlisted
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4">{q.match_score ?? "—"}%</td>
                      <td className="px-3 py-4">{formatINR(q.proposed_cost)}</td>
                      <td className="px-3 py-4">
                        {q.rate_per_sqft
                          ? `₹${q.rate_per_sqft.toLocaleString("en-IN")}/sq ft`
                          : "—"}
                      </td>
                      <td className="px-3 py-4">
                        {q.estimated_duration
                          ? `${q.estimated_duration} months`
                          : "—"}
                      </td>
                      <td className="px-3 py-4">{q.package_type}</td>
                      <td className="px-3 py-4">
                        {q.warranty_years ? `${q.warranty_years} yrs` : "—"}
                      </td>
                      <td className="px-3 py-4">
                        {q.builder_years_experience
                          ? `${q.builder_years_experience} yrs`
                          : "—"}
                        {q.builder_projects_completed != null
                          ? ` · ${q.builder_projects_completed} projects`
                          : ""}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link href={`/builders/${q.builder_id}`}>
                            <Button size="sm" variant="ghost">
                              View Builder
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelected(q)}
                          >
                            View Proposal
                          </Button>
                          <Button
                            size="sm"
                            loading={shortlisting === q.builder_id}
                            onClick={() => shortlist(q.builder_id)}
                          >
                            Shortlist
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid gap-4 lg:hidden">
              {quotes.map((q) => (
                <article
                  key={q.id}
                  className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="min-w-0 flex-1 break-words font-semibold text-ink-900">
                      {q.builder_name}
                    </h3>
                    <span className="shrink-0 text-sm font-medium text-brand-700">
                      {q.match_score ?? "—"}%
                    </span>
                  </div>
                  {q.status === "SHORTLISTED" && (
                    <span className="mt-2 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] text-brand-700">
                      Shortlisted
                    </span>
                  )}
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-ink-400">Cost</dt>
                      <dd className="font-medium">{formatINR(q.proposed_cost)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-400">Rate</dt>
                      <dd className="font-medium">
                        {q.rate_per_sqft
                          ? `₹${q.rate_per_sqft.toLocaleString("en-IN")}`
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-400">Timeline</dt>
                      <dd className="font-medium">
                        {q.estimated_duration
                          ? `${q.estimated_duration} mo`
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-400">Package</dt>
                      <dd className="font-medium">{q.package_type}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-400">Warranty</dt>
                      <dd className="font-medium">
                        {q.warranty_years ? `${q.warranty_years} yrs` : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-400">Experience</dt>
                      <dd className="font-medium">
                        {q.builder_years_experience
                          ? `${q.builder_years_experience} yrs`
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link href={`/builders/${q.builder_id}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        View Builder
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelected(q)}
                    >
                      View Proposal
                    </Button>
                    <Button
                      size="sm"
                      className="w-full"
                      loading={shortlisting === q.builder_id}
                      onClick={() => shortlist(q.builder_id)}
                    >
                      Shortlist
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-card sm:rounded-3xl sm:p-6 pb-safe">
            <h2 className="font-display text-xl text-ink-900 sm:text-2xl">
              {selected.builder_name}
            </h2>
            <p className="mt-2 text-sm text-ink-500">
              {formatINR(selected.proposed_cost)} · {selected.package_type}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-700">
              {selected.proposal_description || "No description provided."}
            </p>
            {selected.included_services?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-ink-400 uppercase">
                  Included
                </p>
                <p className="mt-1 text-sm">{selected.included_services.join(", ")}</p>
              </div>
            )}
            {selected.excluded_services && (
              <div className="mt-3">
                <p className="text-xs font-medium text-ink-400 uppercase">
                  Excluded
                </p>
                <p className="mt-1 text-sm">{selected.excluded_services}</p>
              </div>
            )}
            {selected.payment_terms && (
              <div className="mt-3">
                <p className="text-xs font-medium text-ink-400 uppercase">
                  Payment terms
                </p>
                <p className="mt-1 text-sm">{selected.payment_terms}</p>
              </div>
            )}
            <Button className="mt-6 w-full" onClick={() => setSelected(null)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
