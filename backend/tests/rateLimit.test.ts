import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import express from "express";
import { apiRateLimit, rateLimit } from "../src/middlewares/rateLimit.js";

describe("rateLimit", () => {
  let server: ReturnType<ReturnType<typeof express>["listen"]>;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(
      rateLimit({
        windowMs: 60_000,
        max: 10,
        skipSuccessfulRequests: true,
        message: "Too many login attempts. Please try again later.",
      }),
    );
    app.get("/success", (_req, res) => res.sendStatus(200));
    app.get("/failure", (_req, res) => res.sendStatus(401));

    server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Rate-limit test server did not bind to a port.");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("counts failed attempts but not successful requests", async () => {
    for (let i = 0; i < 15; i++) {
      const response = await fetch(`${baseUrl}/success`);
      expect(response.status).toBe(200);
    }

    for (let i = 0; i < 10; i++) {
      const response = await fetch(`${baseUrl}/failure`);
      expect(response.status).toBe(401);
    }

    const blockedResponse = await fetch(`${baseUrl}/failure`);
    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.headers.get("retry-after")).not.toBeNull();
    await expect(blockedResponse.json()).resolves.toEqual({
      error: "Too many login attempts. Please try again later.",
    });
  });

  it("does not let auth or Inngest polling consume the standard API limit", async () => {
    const app = express();
    app.use("/api", apiRateLimit);
    app.use("/api/auth", (_req, res) => res.sendStatus(200));
    app.use("/api/inngest", (_req, res) => res.sendStatus(200));
    app.all("/api/ordinary", (_req, res) => res.sendStatus(200));

    const isolatedServer = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve, reject) => {
      isolatedServer.once("listening", resolve);
      isolatedServer.once("error", reject);
    });
    const address = isolatedServer.address();
    if (!address || typeof address === "string") {
      throw new Error("Rate-limit test server did not bind to a port.");
    }

    try {
      const isolatedBaseUrl = `http://127.0.0.1:${address.port}`;
      for (const path of ["/api/auth/me", "/api/inngest"]) {
        for (let i = 0; i < 105; i++) {
          const response = await fetch(`${isolatedBaseUrl}${path}`);
          expect(response.status).toBe(200);
        }
      }

      for (let i = 0; i < 100; i++) {
        const response = await fetch(`${isolatedBaseUrl}/api/ordinary`);
        expect(response.status).toBe(200);
      }
      const limitedResponse = await fetch(`${isolatedBaseUrl}/api/ordinary`);
      expect(limitedResponse.status).toBe(429);
    } finally {
      await new Promise<void>((resolve, reject) => {
        isolatedServer.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  it("limits AI generation without limiting insight list reads", async () => {
    const app = express();
    const generationLimit = rateLimit({
      windowMs: 60_000,
      max: 5,
      message: "Too many requests to this resource. Please wait before trying again.",
    });
    app.get("/api/ai-insights", (_req, res) => res.sendStatus(200));
    app.post("/api/ai-insights/generate", generationLimit, (_req, res) =>
      res.sendStatus(201),
    );

    const isolatedServer = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve, reject) => {
      isolatedServer.once("listening", resolve);
      isolatedServer.once("error", reject);
    });
    const address = isolatedServer.address();
    if (!address || typeof address === "string") {
      throw new Error("Rate-limit test server did not bind to a port.");
    }

    try {
      const isolatedBaseUrl = `http://127.0.0.1:${address.port}`;
      for (let i = 0; i < 10; i++) {
        const readResponse = await fetch(`${isolatedBaseUrl}/api/ai-insights`);
        expect(readResponse.status).toBe(200);
      }
      for (let i = 0; i < 5; i++) {
        const generateResponse = await fetch(
          `${isolatedBaseUrl}/api/ai-insights/generate`,
          { method: "POST" },
        );
        expect(generateResponse.status).toBe(201);
      }
      const blockedResponse = await fetch(
        `${isolatedBaseUrl}/api/ai-insights/generate`,
        { method: "POST" },
      );
      expect(blockedResponse.status).toBe(429);
    } finally {
      await new Promise<void>((resolve, reject) => {
        isolatedServer.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
