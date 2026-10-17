import { afterEach, describe, expect, it } from "bun:test";
import { getAiConfigurationError } from "../src/lib/aiConfiguration.js";

const originalEnvironment = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  INNGEST_DEV: process.env.INNGEST_DEV,
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  NODE_ENV: process.env.NODE_ENV,
};

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("getAiConfigurationError", () => {
  it("requires a Gemini API key", () => {
    delete process.env.GEMINI_API_KEY;
    process.env.INNGEST_DEV = "1";
    process.env.NODE_ENV = "development";

    expect(getAiConfigurationError()).toContain("GEMINI_API_KEY");
  });

  it("accepts a configured local AI worker", () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.INNGEST_DEV = "1";
    process.env.NODE_ENV = "development";

    expect(getAiConfigurationError()).toBeUndefined();
  });

  it("requires an Inngest event key in production", () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.NODE_ENV = "production";
    delete process.env.INNGEST_EVENT_KEY;

    expect(getAiConfigurationError()).toContain("INNGEST_EVENT_KEY");

    process.env.INNGEST_EVENT_KEY = "test-event-key";
    delete process.env.INNGEST_SIGNING_KEY;
    expect(getAiConfigurationError()).toContain("INNGEST_SIGNING_KEY");

    process.env.INNGEST_SIGNING_KEY = "test-signing-key";
    expect(getAiConfigurationError()).toBeUndefined();
  });
});
