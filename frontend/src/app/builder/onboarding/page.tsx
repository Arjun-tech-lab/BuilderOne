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
  BUILDER_CONSTRUCTION_TYPES,
  BUILDER_SERVICES,
} from "@/lib/constants";

const STEPS = [
  "Company",
  "Business",
  "Services",
  "Pricing",
  "Portfolio",
  "Review",
];

interface PortfolioDraft {
  name: string;
  location: string;
  project_type: string;
  built_up_area: string;
  project_cost: string;
  completion_year: string;
  description: string;
  images: string[];
}

interface BuilderDraft {
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  description: string;
  office_address: string;
  city: string;
  pincode: string;
  gst_number: string;
  registration_number: string;
  years_experience: string;
  projects_completed: string;
  team_size: string;
  service_areas: string[];
  other_area: string;
  services: string[];
  project_types: string[];
  min_price_per_sqft: string;
  max_price_per_sqft: string;
  min_project_value: string;
  max_project_value: string;
  portfolio: PortfolioDraft[];
}

const emptyPortfolio = (): PortfolioDraft => ({
  name: "",
  location: "",
  project_type: "Independent House",
  built_up_area: "",
  project_cost: "",
  completion_year: "",
  description: "",
  images: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  ],
});

export default function BuilderOnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState<BuilderDraft>({
    company_name: "",
    contact_person: "",
    phone: "",
    email: "",
    description: "",
    office_address: "",
    city: "Bengaluru",
    pincode: "",
    gst_number: "",
    registration_number: "",
    years_experience: "",
    projects_completed: "",
    team_size: "",
    service_areas: [],
    other_area: "",
    services: [],
    project_types: [],
    min_price_per_sqft: "",
    max_price_per_sqft: "",
    min_project_value: "",
    max_project_value: "",
    portfolio: [emptyPortfolio()],
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "BUILDER")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setDraft((d) => ({
        ...d,
        contact_person: d.contact_person || user.name,
        phone: d.phone || user.phone,
        email: d.email || user.email,
      }));
    }
  }, [user]);

  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return (
          draft.company_name &&
          draft.contact_person &&
          draft.phone &&
          draft.email
        );
      case 1:
        return (
          draft.gst_number &&
          Number(draft.years_experience) >= 0 &&
          Number(draft.projects_completed) >= 0
        );
      case 2:
        return draft.service_areas.length > 0 || !!draft.other_area;
      case 3:
        return (
          draft.project_types.length > 0 &&
          draft.services.length > 0 &&
          Number(draft.min_price_per_sqft) > 0 &&
          Number(draft.max_price_per_sqft) > 0
        );
      case 4:
        return draft.portfolio.some((p) => p.name && p.location);
      default:
        return true;
    }
  }, [step, draft]);

  function toggle(list: string[], item: string) {
    return list.includes(item)
      ? list.filter((x) => x !== item)
      : [...list, item];
  }

  async function submit() {
    setSubmitting(true);
    try {
      const areas = [...draft.service_areas];
      if (draft.other_area.trim()) areas.push(draft.other_area.trim());
      await api("/api/builders/profile", {
        method: "POST",
        body: JSON.stringify({
          company_name: draft.company_name,
          contact_person: draft.contact_person,
          phone: draft.phone,
          email: draft.email,
          description: draft.description,
          office_address: draft.office_address,
          city: draft.city,
          pincode: draft.pincode || null,
          gst_number: draft.gst_number,
          registration_number: draft.registration_number || null,
          years_experience: Number(draft.years_experience) || 0,
          projects_completed: Number(draft.projects_completed) || 0,
          team_size: draft.team_size ? Number(draft.team_size) : null,
          service_areas: areas,
          services: draft.services,
          project_types: draft.project_types,
          min_price_per_sqft: Number(draft.min_price_per_sqft) || null,
          max_price_per_sqft: Number(draft.max_price_per_sqft) || null,
          min_project_value: draft.min_project_value
            ? Number(draft.min_project_value)
            : null,
          max_project_value: draft.max_project_value
            ? Number(draft.max_project_value)
            : null,
          portfolio: draft.portfolio
            .filter((p) => p.name)
            .map((p) => ({
              name: p.name,
              location: p.location,
              project_type: p.project_type,
              built_up_area: p.built_up_area ? Number(p.built_up_area) : null,
              project_cost: p.project_cost ? Number(p.project_cost) : null,
              completion_year: p.completion_year
                ? Number(p.completion_year)
                : null,
              description: p.description || null,
              images: p.images,
            })),
        }),
      });
      toast("Builder profile created.", "success");
      router.push("/builder/dashboard");
    } catch (err) {
      toast(
        err instanceof ApiError
          ? err.message
          : "Unable to create profile. Please try again.",
        "error"
      );
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
        <Logo />
        <div className="mt-6 sm:mt-8">
          <ProgressSteps steps={STEPS} current={step} />
        </div>

        {step === 0 && (
          <section className="animate-fade-up space-y-4">
            <h1 className="heading-page font-display text-ink-900">
              Company information
            </h1>
            <div>
              <Label>Company name</Label>
              <Input
                value={draft.company_name}
                onChange={(e) =>
                  setDraft({ ...draft, company_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Contact person</Label>
              <Input
                value={draft.contact_person}
                onChange={(e) =>
                  setDraft({ ...draft, contact_person: e.target.value })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Phone</Label>
                <Input
                  value={draft.phone}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Company description</Label>
              <Textarea
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Office address</Label>
              <Input
                value={draft.office_address}
                onChange={(e) =>
                  setDraft({ ...draft, office_address: e.target.value })
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
                />
              </div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="animate-fade-up space-y-4">
            <h1 className="heading-page font-display text-ink-900">
              Business information
            </h1>
            <p className="text-sm text-ink-500">
              Verification status starts as Pending — we never mark businesses
              as verified without review.
            </p>
            <div>
              <Label>GST number</Label>
              <Input
                value={draft.gst_number}
                onChange={(e) =>
                  setDraft({ ...draft, gst_number: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Company registration number (optional)</Label>
              <Input
                value={draft.registration_number}
                onChange={(e) =>
                  setDraft({ ...draft, registration_number: e.target.value })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Years in business</Label>
                <Input
                  type="number"
                  value={draft.years_experience}
                  onChange={(e) =>
                    setDraft({ ...draft, years_experience: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Projects completed</Label>
                <Input
                  type="number"
                  value={draft.projects_completed}
                  onChange={(e) =>
                    setDraft({ ...draft, projects_completed: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Team size (optional)</Label>
                <Input
                  type="number"
                  value={draft.team_size}
                  onChange={(e) =>
                    setDraft({ ...draft, team_size: e.target.value })
                  }
                />
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="animate-fade-up">
            <h1 className="heading-page font-display text-ink-900">Service areas</h1>
            <div className="mt-6 flex flex-wrap gap-2">
              {BENGALURU_AREAS.map((area) => (
                <SelectChip
                  key={area}
                  selected={draft.service_areas.includes(area)}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      service_areas: toggle(draft.service_areas, area),
                    })
                  }
                >
                  {area}
                </SelectChip>
              ))}
            </div>
            <div className="mt-4">
              <Label>Other area</Label>
              <Input
                value={draft.other_area}
                onChange={(e) =>
                  setDraft({ ...draft, other_area: e.target.value })
                }
                placeholder="Add another locality"
              />
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="animate-fade-up space-y-6">
            <h1 className="heading-page font-display text-ink-900">
              Services & pricing
            </h1>
            <div>
              <Label>Construction types</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {BUILDER_CONSTRUCTION_TYPES.map((t) => (
                  <SelectChip
                    key={t}
                    selected={draft.project_types.includes(t)}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        project_types: toggle(draft.project_types, t),
                      })
                    }
                  >
                    {t}
                  </SelectChip>
                ))}
              </div>
            </div>
            <div>
              <Label>Services</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {BUILDER_SERVICES.map((s) => (
                  <SelectChip
                    key={s}
                    selected={draft.services.includes(s)}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        services: toggle(draft.services, s),
                      })
                    }
                  >
                    {s}
                  </SelectChip>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Min price / sq ft</Label>
                <Input
                  type="number"
                  value={draft.min_price_per_sqft}
                  onChange={(e) =>
                    setDraft({ ...draft, min_price_per_sqft: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Max price / sq ft</Label>
                <Input
                  type="number"
                  value={draft.max_price_per_sqft}
                  onChange={(e) =>
                    setDraft({ ...draft, max_price_per_sqft: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Min project value (₹)</Label>
                <Input
                  type="number"
                  value={draft.min_project_value}
                  onChange={(e) =>
                    setDraft({ ...draft, min_project_value: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Max project value (₹)</Label>
                <Input
                  type="number"
                  value={draft.max_project_value}
                  onChange={(e) =>
                    setDraft({ ...draft, max_project_value: e.target.value })
                  }
                />
              </div>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="animate-fade-up space-y-6">
            <h1 className="heading-page font-display text-ink-900">Portfolio</h1>
            {draft.portfolio.map((p, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-ink-100 bg-white p-5 space-y-3"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Project name</Label>
                    <Input
                      value={p.name}
                      onChange={(e) => {
                        const portfolio = [...draft.portfolio];
                        portfolio[idx] = { ...p, name: e.target.value };
                        setDraft({ ...draft, portfolio });
                      }}
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={p.location}
                      onChange={(e) => {
                        const portfolio = [...draft.portfolio];
                        portfolio[idx] = { ...p, location: e.target.value };
                        setDraft({ ...draft, portfolio });
                      }}
                    />
                  </div>
                  <div>
                    <Label>Built-up area</Label>
                    <Input
                      type="number"
                      value={p.built_up_area}
                      onChange={(e) => {
                        const portfolio = [...draft.portfolio];
                        portfolio[idx] = {
                          ...p,
                          built_up_area: e.target.value,
                        };
                        setDraft({ ...draft, portfolio });
                      }}
                    />
                  </div>
                  <div>
                    <Label>Project cost (₹)</Label>
                    <Input
                      type="number"
                      value={p.project_cost}
                      onChange={(e) => {
                        const portfolio = [...draft.portfolio];
                        portfolio[idx] = {
                          ...p,
                          project_cost: e.target.value,
                        };
                        setDraft({ ...draft, portfolio });
                      }}
                    />
                  </div>
                  <div>
                    <Label>Completion year</Label>
                    <Input
                      type="number"
                      value={p.completion_year}
                      onChange={(e) => {
                        const portfolio = [...draft.portfolio];
                        portfolio[idx] = {
                          ...p,
                          completion_year: e.target.value,
                        };
                        setDraft({ ...draft, portfolio });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={p.description}
                    onChange={(e) => {
                      const portfolio = [...draft.portfolio];
                      portfolio[idx] = { ...p, description: e.target.value };
                      setDraft({ ...draft, portfolio });
                    }}
                  />
                </div>
                <p className="text-xs text-ink-400">
                  Photos use demo image URLs for MVP. Upload API is ready for
                  local/S3 storage.
                </p>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setDraft({
                  ...draft,
                  portfolio: [...draft.portfolio, emptyPortfolio()],
                })
              }
            >
              Add another project
            </Button>
          </section>
        )}

        {step === 5 && (
          <section className="animate-fade-up">
            <h1 className="heading-page font-display text-ink-900">Review</h1>
            <div className="mt-6 rounded-3xl border border-ink-100 bg-white p-6 space-y-3 text-sm">
              <p>
                <strong>{draft.company_name}</strong> · {draft.city}
              </p>
              <p>{draft.description}</p>
              <p>GST: {draft.gst_number}</p>
              <p>
                Experience: {draft.years_experience} yrs ·{" "}
                {draft.projects_completed} projects
              </p>
              <p>Areas: {[...draft.service_areas, draft.other_area].filter(Boolean).join(", ")}</p>
              <p>
                Pricing: ₹{draft.min_price_per_sqft} – ₹{draft.max_price_per_sqft}{" "}
                / sq ft
              </p>
              <p>Portfolio projects: {draft.portfolio.filter((p) => p.name).length}</p>
              <p className="text-ink-500">Verification: PENDING</p>
            </div>
          </section>
        )}

        <div className="sticky-actions mt-8">
          {step > 0 && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </Button>
          )}
          {step < 5 ? (
            <Button
              className="flex-1"
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button className="flex-1" loading={submitting} onClick={submit}>
              Create Builder Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
