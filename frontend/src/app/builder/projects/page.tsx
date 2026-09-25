"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, Logo } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { Input, Label, SelectChip } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { PROPERTY_TYPES } from "@/lib/constants";
import { formatBudgetRange, formatSqft } from "@/lib/format";
import type { ConstructionProject } from "@/types";

export default function BuilderProjectsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [busy, setBusy] = useState(true);
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minMatch, setMinMatch] = useState(0);

  useEffect(() => {
    if (!loading && (!user || user.role !== "BUILDER")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== "BUILDER") return;
    (async () => {
      try {
        const data = await api<ConstructionProject[]>(
          "/api/builders/projects/recommended"
        );
        setProjects(data);
      } catch {
        toast("Unable to load projects. Please try again.", "error");
      } finally {
        setBusy(false);
      }
    })();
  }, [user, toast]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (location && !p.location.toLowerCase().includes(location.toLowerCase()))
        return false;
      if (propertyType && p.property_type !== propertyType) return false;
      if ((p.match_score ?? 0) < minMatch) return false;
      return true;
    });
  }, [projects, location, propertyType, minMatch]);

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <header className="border-b border-ink-100 bg-white pt-safe">
        <div className="page-container page-pad flex h-14 items-center justify-between sm:h-16">
          <Logo />
          <Link href="/builder/dashboard" className="text-sm text-ink-500">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="page-container page-pad py-6 pb-safe sm:py-8 md:py-10">
        <h1 className="heading-page font-display text-ink-900">Project opportunities</h1>
        <p className="mt-2 text-sm text-ink-500">
          Filter by location, property type, and match score.
        </p>

        <div className="mt-6 grid gap-4 rounded-2xl border border-ink-100 bg-white p-4 sm:mt-8 sm:rounded-3xl sm:p-5 md:grid-cols-3">
          <div>
            <Label>Location</Label>
            <Input
              placeholder="e.g. Whitefield"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <Label>Property type</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              <SelectChip
                selected={!propertyType}
                onClick={() => setPropertyType("")}
              >
                All
              </SelectChip>
              {PROPERTY_TYPES.map((t) => (
                <SelectChip
                  key={t}
                  selected={propertyType === t}
                  onClick={() => setPropertyType(t)}
                >
                  {t}
                </SelectChip>
              ))}
            </div>
          </div>
          <div>
            <Label>Min match score: {minMatch}%</Label>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="mt-3 w-full accent-brand-600"
            />
          </div>
        </div>

        {busy ? (
          <div className="mt-8 skeleton h-48 rounded-3xl" />
        ) : filtered.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No matching projects yet."
              description="Try lowering the match filter or complete more of your profile."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5">
            {filtered.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl text-ink-900">
                      {p.location}, {p.city}
                    </h2>
                    <p className="mt-1 text-sm text-ink-500">
                      {p.property_type} · {formatSqft(p.built_up_area)} ·{" "}
                      {p.floors}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {p.match_score}%
                  </span>
                </div>
                <p className="mt-4 text-sm text-ink-600">
                  Budget: {formatBudgetRange(p.budget_min, p.budget_max)}
                  <br />
                  Timeline: {p.timeline}
                </p>
                {p.requirements.length > 0 && (
                  <p className="mt-2 text-sm text-ink-500">
                    {p.requirements.join(" · ")}
                  </p>
                )}
                <Link href={`/builder/projects/${p.id}`} className="mt-5 inline-block w-full sm:w-auto">
                  <Button size="sm" className="w-full sm:w-auto">View Project</Button>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
