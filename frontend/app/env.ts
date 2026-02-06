type Env = {
  /**
   * Public URL of the Next.js frontend (e.g. http://localhost:3000)
   */
  NEXT_PUBLIC_API_URL: string;
  /**
   * URL of the FastAPI backend server (e.g. http://localhost:8000)
   */
  NEXT_PUBLIC_FASTAPI_URL: string;
};

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function validateUrl(value: string, name: string): string {
  try {
    // Throws if not a valid URL
    new URL(value);
    return value;
  } catch {
    throw new Error(`Invalid URL in environment variable ${name}: "${value}"`);
  }
}

function loadEnv(): Env {
  const rawFrontendUrl = requireEnv(
    process.env.NEXT_PUBLIC_API_URL,
    "NEXT_PUBLIC_API_URL",
  );

  const rawFastApiUrl = requireEnv(
    process.env.NEXT_PUBLIC_FASTAPI_URL,
    "NEXT_PUBLIC_FASTAPI_URL",
  );

  return {
    NEXT_PUBLIC_API_URL: validateUrl(
      rawFrontendUrl,
      "NEXT_PUBLIC_API_URL",
    ),
    NEXT_PUBLIC_FASTAPI_URL: validateUrl(rawFastApiUrl, "NEXT_PUBLIC_FASTAPI_URL"),
  };
}

export const env = loadEnv();

