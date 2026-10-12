/**
 * tests/translate-check.ts — EBM verification for the Zotero.Translate
 * class-typed namespace. Mirrors tests/introspect-check.ts but uses
 * /zbr/raw (instead of /zbr/signatures) because Translate.Export is
 * a class and its prototype is invisible to the depth-2 walk.
 *
 * For every method the fork types, we:
 *   1. Confirm it exists on Zotero.Translate.Export.prototype (or Base).
 *   2. Confirm runtime arity is in the declared range.
 *
 * Runtime arities probed 2026-10-12 from a live Zotero 10.0.6:
 *   setItems: 1, setTranslator: 1, setHandler: 2, setLocation: 1,
 *   clearHandlers: 1, removeHandler: 2, translate: 0, complete: 2,
 *   getTranslators: 0, getProgress: 0, setLibraryID: 1, setCollection: 1,
 *   setDisplayOptions: 1.
 *
 * Plus the accessors `document`, `location`, `type` (getters on instance).
 */

import { describe, expect, test } from "bun:test";

const BRIDGE_URL = process.env.BRIDGE_URL ?? "http://localhost:23124";

const METHODS = [
  // Export + Base methods the fork types
  { method: "setItems", arity: [1, 1] },
  { method: "setLibraryID", arity: [1, 1] },
  { method: "setCollection", arity: [1, 1] },
  { method: "setTranslator", arity: [1, 1] },
  { method: "setDisplayOptions", arity: [1, 1] },
  { method: "setLocation", arity: [1, 1] },
  { method: "setHandler", arity: [2, 2] },
  { method: "removeHandler", arity: [2, 2] },
  { method: "clearHandlers", arity: [0, 1] },
  { method: "translate", arity: [0, 0] },
  { method: "complete", arity: [2, 2] },
  { method: "getTranslators", arity: [0, 0] },
  { method: "getProgress", arity: [0, 0] },
] as const;

async function probe(code: string): Promise<unknown> {
  const res = await fetch(`${BRIDGE_URL}/zbr/raw`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`bridge: ${JSON.stringify(data.error)}`);
  return data.result.result;
}

describe("Zotero.Translate.Export surface (live via raw-exec)", () => {
  test("Zotero.Translate.Export is a constructable class", async () => {
    const t = await probe("return typeof Zotero.Translate.Export;");
    expect(t).toBe("function");
  });

  for (const { method, arity } of METHODS) {
    test(`${method} exists with arity ${arity[0]}..${arity[1]}`, async () => {
      const info = (await probe(`
        const exp = new Zotero.Translate.Export();
        return { type: typeof exp.${method}, arity: exp.${method}.length };
      `)) as { type: string; arity: number };
      expect(info.type, `Translate.Export.${method} type`).toBe("function");
      expect(info.arity).toBeGreaterThanOrEqual(arity[0]);
      expect(info.arity).toBeLessThanOrEqual(arity[1]);
    });
  }

  test("accessors (type) are present", async () => {
    const accessors = (await probe(`
      const exp = new Zotero.Translate.Export();
      return { type: exp.type };
    `)) as Record<string, unknown>;
    expect(accessors.type).toBeDefined();
  });
});
