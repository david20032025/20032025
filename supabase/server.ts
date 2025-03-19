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
      getAll() {
        try {
          return cookieStore.getAll().map(({ name, value }) => ({
            name,
            value,
          }));
        } catch (error) {
          // If cookies() is called in an environment where it's not allowed
          console.error("Error accessing cookies:", error);
          return [];
        }
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Use the correct format for setting cookies in Next.js App Router
            cookieStore.set({ name, value, ...options });
          });
        } catch (error) {
          // If cookies() is called in an environment where it's not allowed
          console.error("Error setting cookies:", error);
        }
      },
    },
  });
};
