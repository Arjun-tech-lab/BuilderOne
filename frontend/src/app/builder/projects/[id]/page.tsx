"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Logo } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { Input, Label, SelectChip, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";
import { BUILDER_SERVICES, PACKAGE_TYPES } from "@/lib/constants";
import { formatBudgetRange, formatSqft } from "@/lib/format";
import type { ConstructionProject } from "@/types";

export default function BuilderProjectDetailPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<ConstructionProject | null>(null);
  const [busy, setBusy] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [packageType, setPackageType] = useState("STANDARD");
  const [included, setIncluded] = useState<string[]>(["Turnkey construction"]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "BUILDER")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== "BUILDER") return;
    (async () => {
      try {
        const data = await api<ConstructionProject>(
          `/api/builders/projects/${projectId}`
        );
        setProject(data);
      } catch {
        toast("Unable to load project. Please try again.", "error");
      } finally {
        setBusy(false);
      }
    })();
  }, [user, projectId, toast]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      await api(`/api/builders/projects/${projectId}/quotes`, {
        method: "POST",
        body: JSON.stringify({
          proposed_cost: Number(fd.get("proposed_cost")),
          rate_per_sqft: Number(fd.get("rate_per_sqft")) || null,
          estimated_duration: Number(fd.get("estimated_duration")) || null,
          package_type: packageType,
          proposal_description: String(fd.get("proposal_description") || ""),
          included_services: included,
          excluded_services: String(fd.get("excluded_services") || "") || null,
          warranty_years: Number(fd.get("warranty_years")) || null,
          payment_terms: String(fd.get("payment_terms") || "") || null,
        }),
      });
      toast("Quote submitted successfully.", "success");
      router.push("/builder/dashboard");
    } catch (err) {
      toast(
        err instanceof ApiError
          ? err.message
          : "Your quote could not be submitted. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <header className="border-b border-ink-100 bg-white pt-safe">
        <div className="page-container page-pad flex h-14 max-w-3xl items-center justify-between sm:h-16">
          <Logo />
          <Link href="/builder/projects" className="text-sm text-ink-500">
            All projects
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl page-pad py-6 pb-safe sm:py-10">
        {busy || !project ? (
          <div className="skeleton h-64 rounded-2xl" />
        ) : (
          <>
            <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="heading-page break-words font-display text-ink-900">
                    {project.location}, {project.city}
                  </h1>
                  <p className="mt-2 text-ink-500">{project.property_type}</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                  {project.match_score}% Match
                </span>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4">
                <Item label="Plot" value={formatSqft(project.plot_size)} />
                <Item label="Built-up" value={formatSqft(project.built_up_area)} />
                <Item label="Floors" value={project.floors || "—"} />
                <Item
                  label="Budget"
                  value={formatBudgetRange(project.budget_min, project.budget_max)}
                />
                <Item label="Timeline" value={project.timeline || "—"} />
                <Item
                  label="Beds / Baths"
                  value={`${project.bedrooms || "—"} / ${project.bathrooms || "—"}`}
                />
              </dl>
              <div className="mt-6 border-t border-ink-100 pt-4">
                <p className="text-xs font-medium text-ink-400 uppercase">
                  Requirements
                </p>
                <p className="mt-2 text-sm text-ink-700">
                  {project.requirements.join(" · ") || "—"}
                </p>
                {project.preferred_materials && (
                  <p className="mt-2 text-sm text-ink-500">
                    {project.preferred_materials}
                  </p>
                )}
                {project.additional_requirements && (
                  <p className="mt-2 text-sm text-ink-500">
                    {project.additional_requirements}
                  </p>
                )}
              </div>
              {!showForm && (
                <Button className="mt-8 w-full sm:w-auto" onClick={() => setShowForm(true)}>
                  Submit Quote
                </Button>
              )}
            </div>

            {showForm && (
              <form
                onSubmit={onSubmit}
                className="mt-4 space-y-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:mt-6 sm:rounded-3xl sm:p-6 md:p-8"
              >
                <h2 className="heading-page font-display text-ink-900">
                  Submit your quotation
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Proposed cost (₹)</Label>
                    <Input
                      name="proposed_cost"
                      type="number"
                      required
                      placeholder="4900000"
                      defaultValue={4900000}
                    />
                  </div>
                  <div>
                    <Label>Rate / sq ft (₹)</Label>
                    <Input
                      name="rate_per_sqft"
                      type="number"
                      placeholder="2450"
                      defaultValue={2450}
                    />
                  </div>
                  <div>
                    <Label>Estimated duration (months)</Label>
                    <Input
                      name="estimated_duration"
                      type="number"
                      placeholder="9"
                      defaultValue={9}
                    />
                  </div>
                  <div>
                    <Label>Warranty (years)</Label>
                    <Input
                      name="warranty_years"
                      type="number"
                      placeholder="5"
                      defaultValue={5}
                    />
                  </div>
                </div>
                <div>
                  <Label>Material / package</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PACKAGE_TYPES.map((p) => (
                      <SelectChip
                        key={p}
                        selected={packageType === p}
                        onClick={() => setPackageType(p)}
                      >
                        {p}
                      </SelectChip>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Proposal description</Label>
                  <Textarea
                    name="proposal_description"
                    required
                    defaultValue="Complete turnkey proposal including structure, finishing, electrical, plumbing, and solar readiness."
                  />
                </div>
                <div>
                  <Label>Included services</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {BUILDER_SERVICES.map((s) => (
                      <SelectChip
                        key={s}
                        selected={included.includes(s)}
                        onClick={() =>
                          setIncluded((prev) =>
                            prev.includes(s)
                              ? prev.filter((x) => x !== s)
                              : [...prev, s]
                          )
                        }
                      >
                        {s}
                      </SelectChip>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Excluded services</Label>
                  <Textarea
                    name="excluded_services"
                    defaultValue="Modular kitchen appliances, soft furnishings"
                  />
                </div>
                <div>
                  <Label>Payment terms</Label>
                  <Textarea
                    name="payment_terms"
                    defaultValue="30% advance, 40% at structure, 25% at finishing, 5% on handover"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={submitting} className="flex-1">
                    Submit Quote
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink-900">{value}</dd>
    </div>
  );
}
