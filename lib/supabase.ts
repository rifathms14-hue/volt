import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/job";

/**
 * Supabase Client
 * Creates a type-safe Supabase client instance
 * 
 * Environment Variables Required:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anon/public key
 * 
 * Note: These should be set in your .env.local file (see SUPABASE_SETUP.md)
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only throw errors in production or if we're actually trying to use Supabase
// This allows the app to build/run during development even without env vars
const getSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Use dummy values in development to prevent build errors
    // Actual queries will fail, which is fine for now
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️  Supabase environment variables not set. Using placeholder values."
      );
      console.warn(
        "   Create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
      return {
        url: "https://placeholder.supabase.co",
        key: "placeholder-key",
      };
    }
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return { url: supabaseUrl, key: supabaseAnonKey };
};

const config = getSupabaseConfig();

export const supabase = createClient<Database>(config.url, config.key, {
  auth: {
    persistSession: false, // We're using RLS for auth, but not implementing user auth yet
  },
});

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Supabase Client for Server Components
 * Use this in Server Components and API routes
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase environment variables not set. Please configure .env.local"
    );
  }

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
    },
  });
}
