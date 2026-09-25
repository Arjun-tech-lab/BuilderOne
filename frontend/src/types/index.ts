export type UserRole = "CUSTOMER" | "BUILDER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ConstructionProject {
  id: number;
  customer_id: number;
  location: string;
  city: string;
  pincode?: string | null;
  property_type: string;
  plot_size?: number | null;
  built_up_area?: number | null;
  floors?: string | null;
  bedrooms?: string | null;
  bathrooms?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  timeline?: string | null;
  status: string;
  preferred_materials?: string | null;
  additional_requirements?: string | null;
  requirements: string[];
  match_score?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioProject {
  id: number;
  name: string;
  location: string;
  project_type: string;
  built_up_area?: number | null;
  project_cost?: number | null;
  completion_year?: number | null;
  description?: string | null;
  images: string[];
}

export interface BuilderProfile {
  id: number;
  user_id: number;
  company_name: string;
  contact_person: string;
  description?: string | null;
  phone: string;
  email: string;
  gst_number?: string | null;
  registration_number?: string | null;
  office_address?: string | null;
  city: string;
  pincode?: string | null;
  years_experience: number;
  projects_completed: number;
  team_size?: number | null;
  min_price_per_sqft?: number | null;
  max_price_per_sqft?: number | null;
  min_project_value?: number | null;
  max_project_value?: number | null;
  logo_url?: string | null;
  verification_status: string;
  rating?: number | null;
  service_areas: string[];
  services: string[];
  project_types: string[];
  portfolio: PortfolioProject[];
  match_score?: number | null;
  profile_completion?: number | null;
  missing_fields?: string[];
  created_at?: string;
}

export interface Quote {
  id: number;
  project_id: number;
  builder_id: number;
  proposed_cost: number;
  rate_per_sqft?: number | null;
  estimated_duration?: number | null;
  package_type: string;
  proposal_description?: string | null;
  included_services: string[];
  excluded_services?: string | null;
  warranty_years?: number | null;
  payment_terms?: string | null;
  status: string;
  created_at?: string;
  builder_name?: string | null;
  builder_years_experience?: number | null;
  builder_projects_completed?: number | null;
  match_score?: number | null;
  logo_url?: string | null;
}

export interface ProjectDraft {
  location: string;
  city: string;
  pincode: string;
  property_type: string;
  plot_size: string;
  built_up_area: string;
  floors: string;
  bedrooms: string;
  bathrooms: string;
  budget_min: number | null;
  budget_max: number | null;
  budget_preset: string;
  timeline: string;
  requirements: string[];
  preferred_materials: string;
  additional_requirements: string;
}
