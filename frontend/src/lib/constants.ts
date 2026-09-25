export const BENGALURU_AREAS = [
  "Whitefield",
  "Sarjapur",
  "Electronic City",
  "HSR Layout",
  "Koramangala",
  "Yelahanka",
  "Hebbal",
  "Kanakapura Road",
  "Devanahalli",
  "Bannerghatta Road",
  "Indiranagar",
  "JP Nagar",
  "Jayanagar",
  "Marathahalli",
] as const;

export const PROPERTY_TYPES = [
  "Independent House",
  "Villa",
  "Duplex",
  "Other",
] as const;

export const FLOOR_OPTIONS = [
  "Ground floor",
  "G + 1",
  "G + 2",
  "G + 3",
  "G + 4+",
] as const;

export const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5+"] as const;
export const BATHROOM_OPTIONS = ["1", "2", "3", "4", "5+"] as const;

export const BUDGET_PRESETS = [
  { label: "₹20L – ₹30L", min: 20_00_000, max: 30_00_000 },
  { label: "₹30L – ₹40L", min: 30_00_000, max: 40_00_000 },
  { label: "₹40L – ₹50L", min: 40_00_000, max: 50_00_000 },
  { label: "₹50L – ₹75L", min: 50_00_000, max: 75_00_000 },
  { label: "₹75L – ₹1Cr", min: 75_00_000, max: 1_00_00_000 },
  { label: "₹1Cr+", min: 1_00_00_000, max: 5_00_00_000 },
] as const;

export const TIMELINE_OPTIONS = [
  "Within 6 months",
  "6–9 months",
  "9–12 months",
  "12–18 months",
  "Flexible",
] as const;

export const CUSTOMER_REQUIREMENTS = [
  "Turnkey construction",
  "Civil construction",
  "Architecture + construction",
  "Interior work",
  "Electrical",
  "Plumbing",
  "Painting",
  "Landscaping",
  "Solar installation",
  "Rainwater harvesting",
  "Modular kitchen",
  "False ceiling",
  "Other",
] as const;

export const BUILDER_CONSTRUCTION_TYPES = [
  "Independent houses",
  "Villas",
  "Duplexes",
  "Renovation",
] as const;

export const BUILDER_SERVICES = [
  "Turnkey construction",
  "Civil construction",
  "Architecture",
  "Interior",
  "Electrical",
  "Plumbing",
  "Landscaping",
  "Solar",
  "Other",
] as const;

export const PACKAGE_TYPES = ["BASIC", "STANDARD", "PREMIUM", "CUSTOM"] as const;

/** Demo trust stats — replace with live DB aggregates later */
export const TRUST_STATS = [
  { value: "10+", label: "construction categories" },
  { value: "100+", label: "project opportunities" },
  { value: "50+", label: "builders" },
] as const;
