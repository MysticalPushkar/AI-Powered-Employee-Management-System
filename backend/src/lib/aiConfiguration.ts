/** Returns a setup message when AI generation cannot run with the current env. */
export function getAiConfigurationError(): string | undefined {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    return "AI generation is not configured. Set GEMINI_API_KEY in backend/.env.";
  }

  if (process.env.NODE_ENV === "production") {
    if (!process.env.INNGEST_EVENT_KEY?.trim()) {
      return "Background jobs are not configured. Set INNGEST_EVENT_KEY.";
    }
    if (!process.env.INNGEST_SIGNING_KEY?.trim()) {
      return "Background jobs are not configured. Set INNGEST_SIGNING_KEY.";
    }
  } else if (process.env.INNGEST_DEV !== "1") {
    return "Background jobs are not in local dev mode. Set INNGEST_DEV=1 in backend/.env.";
  }
}
