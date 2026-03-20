type Env = {
  /**
   * URL of the Supabase project
   */
  NEXT_PUBLIC_SUPABASE_URL: string;
  /**
   * Supabase service role key (server-side only)
   */
  SUPABASE_SERVICE_ROLE_KEY: string;
};

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function validateUrl(value: string, name: string): string {
  try {
    new URL(value);
    return value;
  } catch {
    throw new Error(`Invalid URL in environment variable ${name}: "${value}"`);
  }
}

function loadEnv(): Env {
  const rawSupabaseUrl = requireEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL",
  );

  const rawServiceKey = requireEnv(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  return {
    NEXT_PUBLIC_SUPABASE_URL: validateUrl(rawSupabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: rawServiceKey,
  };
}

export const env = loadEnv();
