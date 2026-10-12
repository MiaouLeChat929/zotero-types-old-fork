// types/xpcom/translate/translate.d.ts — Zotero 10 Translate namespace.
//
// Fork addition (MiaouLeChat929/zotero-types): upstream zotero-types@4.1.3
// has no Translate namespace. The bridge uses Zotero.Translate.Export for
// CSL-style export (BibTeX, RIS, ...). Signatures derived from live probes
// against Zotero 10.0.6 (2026-10-12): Object.getOwnPropertyNames on
// Translate, Translate.Export.prototype, Translate.Base.prototype.
//
// Only the PUBLIC surface the bridge consumes is typed here (setItems,
// setTranslator, setHandler, translate, ...). The many _-prefixed
// internals are intentionally omitted — they are translator-sandbox
// plumbing that no plugin should touch.
//
// Sync policy: this file is FORK-SPECIFIC. When upstream adds a Translate
// namespace, drop this file. See docs/FORK_POLICY.md.

declare namespace Zotero {
  namespace Translate {
    /**
     * Handler callback shape. `obj` is the translate instance; payload
     * varies per event ("done" carries {string}, "error" carries the err).
     */
    type Handler = (obj: unknown, payload?: unknown) => void;

    /** Common base: handler registration + translator selection. */
    interface Base {
      /** Register an event handler ("done", "error", "debug", ...). */
      setHandler(type: string, handler: Handler): void;
      /** Remove one handler. */
      removeHandler(type: string, handler: Handler): void;
      /** Remove all handlers for a type (or all types). */
      clearHandlers(type?: string): void;
      /** Translator UUID or numeric ID. */
      setTranslator(translatorId: string | number): void;
      /** Progress fraction 0..1 (undefined until translation starts). */
      getProgress(): number | undefined;
    }

    /**
     * Export translator. Construct via `new Zotero.Translate.Export()`.
     * Usage (bridge pattern, services/export.ts):
     *   const t = new Zotero.Translate.Export();
     *   t.setItems(items);
     *   t.setTranslator(translatorId);
     *   t.setHandler("done", (obj) => resolve(obj.string));
     *   t.setHandler("error", (_obj, err) => reject(err));
     *   t.translate();
     */
    interface Export extends Base {
      /** Items to export (Zotero.Item[]). */
      setItems(items: Zotero.Item[]): void;
      /** Export from a whole library instead of items. */
      setLibraryID(libraryID: number): void;
      /** Export from a collection instead of items. */
      setCollection(collection: Zotero.Collection): void;
      /** Per-translator display options (exportImport directory). */
      setDisplayOptions(options: Record<string, unknown>): void;
      /** Kick off the translation. Completion via the "done" handler. */
      translate(): void;
      /** List usable translators for the current configuration. */
      getTranslators(): Promise<unknown[]>;
    }
  }
}
