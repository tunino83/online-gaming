import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

/** Legge apps/web/.env (righe NOME=valore). */
function leggiEnv(percorso: string): Record<string, string> {
  if (!existsSync(percorso)) return {};
  return Object.fromEntries(
    readFileSync(percorso, "utf8")
      .split(/\r?\n/)
      .filter((r) => /^[A-Z_]+=/.test(r))
      .map((r) => [r.slice(0, r.indexOf("=")), r.slice(r.indexOf("=") + 1).trim()]),
  );
}

// Test contro il progetto Supabase di prova (servono rete e apps/web/.env compilato).
export default defineConfig({
  test: {
    include: ["supabase/tests/**/*.test.ts"],
    env: leggiEnv("apps/web/.env"),
    testTimeout: 30000,
  },
});
