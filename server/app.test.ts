import { createServer } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app";

let server: ReturnType<typeof createServer>;
let origin: string;

beforeAll(async () => {
  server = createServer(createApp());
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not start");
  origin = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close(error => (error ? reject(error) : resolve()))
  );
});

describe("shared Express application", () => {
  it("serves the public auth.me tRPC procedure for a serverless runtime", async () => {
    const input = encodeURIComponent(JSON.stringify({ 0: { json: null } }));
    const response = await fetch(`${origin}/api/trpc/auth.me?batch=1&input=${input}`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      { result: { data: { json: null } } },
    ]);
  });
});
