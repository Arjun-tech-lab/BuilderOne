export function formatINR(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  if (amount >= 1_00_00_000) {
    const cr = amount / 1_00_00_000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)}Cr`;
  }
  if (amount >= 1_00_000) {
    const lakh = amount / 1_00_000;
    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)}L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBudgetRange(
  min?: number | null,
  max?: number | null
): string {
  if (min == null && max == null) return "—";
  if (min != null && max != null) return `${formatINR(min)} – ${formatINR(max)}`;
  if (min != null) return `From ${formatINR(min)}`;
  return `Up to ${formatINR(max!)}`;
}

export function formatSqft(n?: number | null): string {
  if (n == null) return "—";
  return `${n.toLocaleString("en-IN")} sq ft`;
}

export function greetingForNow(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function projectStatusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "Draft",
    OPEN: "Looking for builders",
    RECEIVING_QUOTES: "Receiving quotes",
    QUOTES_AVAILABLE: "Quotes available",
    SHORTLISTED: "Shortlisted",
    BUILDER_SELECTED: "Builder selected",
    CLOSED: "Closed",
  };
  return map[status] || status;
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
