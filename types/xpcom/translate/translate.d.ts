// types/xpcom/translate/translate.d.ts — Zotero 10 Translate namespace.
//
// Fork addition (MiaouLeChat929/zotero-types): upstream zotero-types@4.1.3
// has no Translate namespace. The bridge uses Zotero.Translate.Export for
// CSL-style export (BibTeX, RIS, etc.). We provide a minimal interface
// based on the live Zotero 10 runtime and the Mozilla source.
//
// Sync policy: this file is FORK-SPECIFIC. When upstream adds a Translate
// namespace, drop this file. See docs/FORK_POLICY.md.

declare namespace Zotero {
  namespace Translate {
    /**
     * Sandbox instance for translation operations. Construct via
     * `new Zotero.Translate.Export()` for exports.
     */
    class Sandbox {
      constructor();
      /**
       * Set the items to be processed.
       * @param items Zotero.Item[]
       */
      setItems(items: Zotero.Item[]): void;
      /**
       * Set the translator ID to use.
       * @param id Translator UUID (string) or numeric ID
       */
      setTranslator(id: string | number): void;
      /**
       * Set the output file path.
       */
      setLocation(path: string): void;
    }

    /**
     * Export-oriented translator wrapper. Construct with `new
     * Zotero.Translate.Export()` and chain the setters above, then call
     `Zotero.Translate.Export.prototype.translate()` (inherited from the
     underlying translator).
     */
    class Export extends Sandbox {
      translate(): Promise<string>;
    }
  }
}
