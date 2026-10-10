import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  home_country: string | null;
  preferred_currency: string;
  travel_style: string;
  dietary_preferences: string[];
  interests: string[];
  created_at: string;
  updated_at: string;
};

export type SavedTrip = {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  cover_image: string | null;
  start_date: string | null;
  end_date: string | null;
  travelers: number;
  budget: number | null;
  budget_currency: string;
  itinerary_data: ItineraryDay[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  place_id: string;
  place_name: string;
  place_type: "destination" | "restaurant" | "hotel" | "attraction";
  place_data: Record<string, unknown>;
  created_at: string;
};

export type ItineraryActivity = {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  cost: number;
  category: string;
  lat?: number;
  lng?: number;
};

export type ItineraryDay = {
  day: number;
  date: string;
  theme: string;
  activities: ItineraryActivity[];
  restaurant: string;
  accommodation: string;
  dailyCost: number;
};
