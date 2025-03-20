import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set",
    );
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        try {
          return cookieStore.get(name)?.value;
        } catch (error) {
          console.error(`Error getting cookie ${name}:`, error);
          return undefined;
        }
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          console.error(`Error setting cookie ${name}:`, error);
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        } catch (error) {
          console.error(`Error removing cookie ${name}:`, error);
        }
      },
    },
  });
};
