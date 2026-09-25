"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Logo, ProgressSteps } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { Input, Label, SelectChip, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";
import {
  BENGALURU_AREAS,
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  BUDGET_PRESETS,
  CUSTOMER_REQUIREMENTS,
  FLOOR_OPTIONS,
  PROPERTY_TYPES,
  TIMELINE_OPTIONS,
} from "@/lib/constants";
import { formatBudgetRange, formatSqft } from "@/lib/format";
import type { ProjectDraft } from "@/types";

const STEPS = [
  "Location",
  "Property",
  "Budget",
  "Timeline",
  "Requirements",
  "Review",
];

const DRAFT_KEY = "builderone_project_draft";

const emptyDraft: ProjectDraft = {
  location: "",
  city: "Bengaluru",
  pincode: "",
  property_type: "",
  plot_size: "",
  built_up_area: "",
  floors: "",
  bedrooms: "",
  bathrooms: "",
  budget_min: null,
  budget_max: null,
  budget_preset: "",
  timeline: "",
  requirements: [],
  preferred_materials: "",
  additional_requirements: "",
};

export default function CustomerOnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProjectDraft>(emptyDraft);
  const [customBudget, setCustomBudget] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "CUSTOMER")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        setDraft({ ...emptyDraft, ...JSON.parse(raw) });
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return draft.location.trim().length > 0 && draft.city.trim().length > 0;
      case 1:
        return (
          !!draft.property_type &&
          Number(draft.plot_size) > 0 &&
          Number(draft.built_up_area) > 0 &&
          !!draft.floors &&
          !!draft.bedrooms &&
          !!draft.bathrooms
        );
      case 2:
        return draft.budget_min != null && draft.budget_max != null;
      case 3:
        return !!draft.timeline;
      case 4:
        return draft.requirements.length > 0;
      default:
        return true;
    }
  }, [step, draft]);

  function toggleRequirement(req: string) {
    setDraft((d) => ({
      ...d,
      requirements: d.requirements.includes(req)
        ? d.requirements.filter((r) => r !== req)
        : [...d.requirements, req],
    }));
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const project = await api<{ id: number }>("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          location: draft.location,
          city: draft.city,
          pincode: draft.pincode || null,
          property_type: draft.property_type,
          plot_size: Number(draft.plot_size),
          built_up_area: Number(draft.built_up_area),
          floors: draft.floors,
          bedrooms: draft.bedrooms,
          bathrooms: draft.bathrooms,
          budget_min: draft.budget_min,
          budget_max: draft.budget_max,
          timeline: draft.timeline,
          requirements: draft.requirements,
          preferred_materials: draft.preferred_materials || null,
          additional_requirements: draft.additional_requirements || null,
          status: "OPEN",
        }),
      });
      localStorage.removeItem(DRAFT_KEY);
      toast("Project created. Finding matching builders…", "success");
      router.push(`/customer/dashboard?project=${project.id}`);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Unable to save project. Please try again.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="skeleton h-10 w-40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <div className="mx-auto max-w-2xl page-pad py-6 pb-safe sm:py-8">
        <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
          <Logo />
          <button
            type="button"
            className="shrink-0 text-sm text-ink-500 hover:text-ink-800"
            onClick={() => router.push("/customer/dashboard")}
          >
            Skip
          </button>
        </div>
        <ProgressSteps steps={STEPS} current={step} />

        {step === 0 && (
          <section className="animate-fade-up">
            <h1 className="heading-page font-display text-ink-900">
              Where are you planning to build?
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              Your locality helps us match builders who serve your area.
            </p>
            <div className="mt-8 space-y-4">
              <div>
                <Label>Area / locality</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BENGALURU_AREAS.slice(0, 10).map((area) => (
                    <SelectChip
                      key={area}
                      selected={draft.location === area}
                      onClick={() => setDraft({ ...draft, location: area })}
                    >
                      {area}
                    </SelectChip>
                  ))}
                </div>
                <Input
                  className="mt-3"
                  placeholder="Or type your locality"
                  value={draft.location}
                  onChange={(e) =>
                    setDraft({ ...draft, location: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>City</Label>
                  <Input
                    value={draft.city}
                    onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <Input
                    value={draft.pincode}
                    onChange={(e) =>
                      setDraft({ ...draft, pincode: e.target.value })
                    }
                    placeholder="560066"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  toast("Location detection coming soon — please select your area.", "info")
                }
              >
                Use my location
              </Button>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="animate-fade-up">
            <h1 className="heading-page font-display text-ink-900">
              Tell us about the home you want to build
            </h1>
            <div className="mt-8 space-y-6">
              <div>
                <Label>Property type</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((t) => (
                    <SelectChip
                      key={t}
                      selected={draft.property_type === t}
                      onClick={() => setDraft({ ...draft, property_type: t })}
                    >
                      {t}
                    </SelectChip>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Plot size (sq ft)</Label>
                  <Input
                    type="number"
                    value={draft.plot_size}
                    onChange={(e) =>
                      setDraft({ ...draft, plot_size: e.target.value })
                    }
                    placeholder="2400"
                  />
                </div>
                <div>
                  <Label>Expected built-up area (sq ft)</Label>
                  <Input
                    type="number"
                    value={draft.built_up_area}
                    onChange={(e) =>
                      setDraft({ ...draft, built_up_area: e.target.value })
                    }
                    placeholder="2000"
                  />
                </div>
              </div>
              <div>
                <Label>Number of floors</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FLOOR_OPTIONS.map((f) => (
                    <SelectChip
                      key={f}
                      selected={draft.floors === f}
                      onClick={() => setDraft({ ...draft, floors: f })}
                    >
                      {f}
                    </SelectChip>
                  ))}
                </div>
              </div>
              <div>
                <Label>Bedrooms</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BEDROOM_OPTIONS.map((b) => (
                    <SelectChip
                      key={b}
                      selected={draft.bedrooms === b}
                      onClick={() => setDraft({ ...draft, bedrooms: b })}
                    >
                      {b}
                    </SelectChip>
                  ))}
                </div>
              </div>
              <div>
                <Label>Bathrooms</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BATHROOM_OPTIONS.map((b) => (
                    <SelectChip
                      key={b}
                      selected={draft.bathrooms === b}
                      onClick={() => setDraft({ ...draft, bathrooms: b })}
                    >
                      {b}
                    </SelectChip>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="animate-fade-up">
            <h1 className="heading-page font-display text-ink-900">
              What&apos;s your construction budget?
            </h1>
            <div className="mt-8 flex flex-wrap gap-2">
              {BUDGET_PRESETS.map((p) => (
                <SelectChip
                  key={p.label}
                  selected={!customBudget && draft.budget_preset === p.label}
                  onClick={() => {
                    setCustomBudget(false);
                    setDraft({
                      ...draft,
                      budget_preset: p.label,
                      budget_min: p.min,
                      budget_max: p.max,
                    });
                  }}
                >
                  {p.label}
                </SelectChip>
              ))}
              <SelectChip
                selected={customBudget}
                onClick={() => {
                  setCustomBudget(true);
                  setDraft({ ...draft, budget_preset: "Custom" });
                }}
              >
                Custom budget
              </SelectChip>
            </div>
            {customBudget && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Minimum (₹)</Label>
                  <Input
                    type="number"
                    value={draft.budget_min ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        budget_min: Number(e.target.value) || null,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Maximum (₹)</Label>
                  <Input
                    type="number"
                    value={draft.budget_max ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        budget_max: Number(e.target.value) || null,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section className="animate-fade-up">
            <h1 className="heading-page font-display text-ink-900">
              When would you like your home completed?
            </h1>
            <div className="mt-8 flex flex-col gap-3">
              {TIMELINE_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDraft({ ...draft, timeline: t })}
                  className={`rounded-2xl border px-5 py-4 text-left transition ${
                    draft.timeline === t
                      ? "border-brand-600 bg-brand-50"
                      : "border-ink-200 bg-white hover:border-ink-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="animate-fade-up">
            <h1 className="heading-page font-display text-ink-900">
              What do you need from your builder?
            </h1>
            <div className="mt-8 flex flex-wrap gap-2">
              {CUSTOMER_REQUIREMENTS.map((r) => (
                <SelectChip
                  key={r}
                  selected={draft.requirements.includes(r)}
                  onClick={() => toggleRequirement(r)}
                >
                  {r}
                </SelectChip>
              ))}
            </div>
            <div className="mt-6">
              <Label>Preferred material / specifications</Label>
              <Input
                placeholder="Premium tiles, branded electrical fittings, UPVC windows…"
                value={draft.preferred_materials}
                onChange={(e) =>
                  setDraft({ ...draft, preferred_materials: e.target.value })
                }
              />
            </div>
            <div className="mt-4">
              <Label>Additional requirements</Label>
              <Textarea
                value={draft.additional_requirements}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    additional_requirements: e.target.value,
                  })
                }
              />
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="animate-fade-up">
            <h1 className="heading-page font-display text-ink-900">
              Project summary
            </h1>
            <div className="mt-8 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Item label="Location" value={`${draft.location}, ${draft.city}`} />
                <Item label="Property" value={draft.property_type} />
                <Item label="Plot" value={formatSqft(Number(draft.plot_size))} />
                <Item
                  label="Built-up"
                  value={formatSqft(Number(draft.built_up_area))}
                />
                <Item label="Floors" value={draft.floors} />
                <Item
                  label="Budget"
                  value={formatBudgetRange(draft.budget_min, draft.budget_max)}
                />
                <Item label="Timeline" value={draft.timeline} />
                <Item
                  label="Bedrooms / Bathrooms"
                  value={`${draft.bedrooms} / ${draft.bathrooms}`}
                />
              </dl>
              <div className="mt-6 border-t border-ink-100 pt-4">
                <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">
                  Requirements
                </p>
                <p className="mt-2 text-sm text-ink-700">
                  {draft.requirements.join(" · ")}
                </p>
                {draft.preferred_materials && (
                  <p className="mt-2 text-sm text-ink-500">
                    {draft.preferred_materials}
                  </p>
                )}
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </section>
        )}

        <div className="sticky-actions mt-8">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1"
            >
              {step === 5 ? "Edit" : "Back"}
            </Button>
          )}
          {step < 5 ? (
            <Button
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
              className="flex-1"
            >
              Continue
            </Button>
          ) : (
            <Button
              loading={submitting}
              onClick={submit}
              className="flex-1"
            >
              Find Matching Builders
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-ink-400 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink-900">{value || "—"}</dd>
    </div>
  );
}
