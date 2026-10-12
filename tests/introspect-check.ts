/**
 * tests/introspect-check.ts — EBM verification: fork .d.ts signatures vs the
 * LIVE Zotero runtime.
 *
 * Evidence-Based Methodology applied to type definitions: every typed
 * method in the fork's fork-specific files MUST exist in the live runtime
 * with a compatible arity. The bridge's /zbr/signatures endpoint is the
 * ground truth (it introspects the actual Zotero 10 process).
 *
 * Checks per fork-specific surface:
 *   1. EXISTENCE: every declared function exists at runtime.
 *   2. ARITY: runtime fn.length falls inside the declared range
 *      (declared ranges cover optional params).
 *   3. BACKLOG: runtime-only methods are printed as an enrichment TODO
 *      list (warn, never fail — that's the work queue, not a lie).
 *
 * Usage:
 *   bun test tests/introspect-check.ts
 *   BRIDGE_URL=http://localhost:23124 bun test tests/introspect-check.ts
 *
 * Failure semantics: a fork type that lies about the runtime = test FAIL.
 */

import { describe, expect, test } from "bun:test";

const BRIDGE_URL = process.env.BRIDGE_URL ?? "http://localhost:23124";

// Fork-specific surfaces under verification. When a file is dropped
// (upstream covered it), remove its entry here.
const FORK_SURFACES: Array<{
  file: string;
  namespace: string; // key inside /zbr/signatures result.signatures
  methods: Record<string, [minArity, maxArity]>;
}> = [
  {
    file: "types/xpcom/data/itemFields.d.ts",
    namespace: "ItemFields",
    methods: {
      getAll: [0, 0],
      getBaseIDFromTypeAndField: [2, 2],
      getBaseMappedFields: [0, 1],
      getDirection: [2, 3],
      getFieldIDFromTypeAndBase: [2, 2],
      getID: [1, 1],
      getItemTypeFields: [1, 1],
      getLocalizedString: [1, 2],
      getName: [1, 2],
      getTypeFieldsFromBase: [1, 2],
      init: [0, 0],
      isAutocompleteField: [1, 2],
      isBaseField: [1, 2],
      isCustom: [1, 1],
      isDate: [1, 2],
      isFieldOfBase: [2, 2],
      isInteger: [1, 2],
      isLong: [0, 2], // runtime reports arity 0 (optional param)
      isMultiline: [1, 2],
      isValidForType: [2, 2],
    },
  },
  {
    file: "types/xpcom/fulltext.d.ts (fork additions)",
    namespace: "FullText", // capital T per /zbr/signatures key
    methods: {
      flagNoteStale: [2, 2],
      getNoteIndexQueueCount: [0, 0],
      getAttachmentIndexQueueCount: [0, 0],
      processNoteIndexQueue: [0, 0],
      processAttachmentIndexQueue: [0, 0],
      // Core search + index methods the bridge uses (upstream zotero-types@4.1.3
      // already declares these in the upstream fulltext.d.ts; fork types the
      // EBM-verified return shape `Array<{id: number}>` for findTextInItems,
      // which is what the bridge actually iterates on).
      findTextInItems: [3, 3],
      indexItems: [1, 1],
      getIndexedState: [1, 1],
    },
  },
  {
    file: "types/xpcom/dataDirectory.d.ts",
    namespace: "DataDirectory",
    methods: {
      getDatabase: [0, 2],
    },
  },
  {
    file: "types/xpcom/groups.d.ts",
    namespace: "Groups",
    methods: {
      getAll: [0, 0],
      getByLibraryID: [1, 1],
    },
  },
  {
    file: "types/xpcom/libraries.d.ts",
    namespace: "Libraries",
    methods: {
      get: [1, 1], // fork typings: get(libraryID): Zotero.Library | false
      getAll: [0, 0], // fork typings: getAll(): Zotero.Library[]
    },
  },
];

type SigInfo = { arity: number; params: string[]; returnHint: string };
let runtimeSignatures: Record<string, Record<string, SigInfo>> | null = null;
let zoteroVersion = "";

async function loadSignatures(): Promise<void> {
  if (runtimeSignatures) return;
  const res = await fetch(`${BRIDGE_URL}/zbr/signatures`);
  if (!res.ok) {
    throw new Error(
      `bridge ${BRIDGE_URL} returned ${res.status} — is Zotero + the bridge running?`,
    );
  }
  const data = await res.json();
  if (!data.ok) throw new Error(`bridge error: ${JSON.stringify(data.error)}`);
  runtimeSignatures = data.result.signatures;
  zoteroVersion = data.result.zotero_version;
}

describe(`fork types vs live Zotero (${BRIDGE_URL})`, () => {
  test("bridge reachable + signatures loaded", async () => {
    await loadSignatures();
    expect(Object.keys(runtimeSignatures!).length).toBeGreaterThan(10);
  });

  for (const surface of FORK_SURFACES) {
    describe(`${surface.namespace} (${surface.file})`, () => {
      test("namespace exists at runtime", async () => {
        await loadSignatures();
        expect(runtimeSignatures!).toHaveProperty(surface.namespace);
      });

      for (const [method, [minArity, maxArity]] of Object.entries(
        surface.methods,
      )) {
        test(`${method} arity ${minArity}..${maxArity}`, async () => {
          await loadSignatures();
          const ns = runtimeSignatures![surface.namespace];
          expect(ns, `runtime ${surface.namespace} namespace`).toBeDefined();
          const sig = ns[method];
          expect(
            sig,
            `runtime ${surface.namespace}.${method} — typed in fork but ABSENT at runtime`,
          ).toBeDefined();
          if (!sig) return;
          expect(sig.arity).toBeGreaterThanOrEqual(minArity);
          expect(sig.arity).toBeLessThanOrEqual(maxArity);
        });
      }

      test("backlog: runtime methods not yet typed (report)", async () => {
        await loadSignatures();
        const ns = runtimeSignatures![surface.namespace] ?? {};
        const runtimeMethods = Object.keys(ns).filter(
          (m) => !m.startsWith("_") && m !== "init",
        );
        const untyped = runtimeMethods.filter((m) => !(m in surface.methods));
        if (untyped.length > 0) {
          console.warn(
            `[backlog] ${surface.namespace}: ${untyped.length} runtime methods not yet typed: ${untyped.join(", ")}`,
          );
        }
        // never fails: the backlog IS the enrichment queue
        expect(untyped.length).toBeGreaterThanOrEqual(0);
      });
    });
  }
});
