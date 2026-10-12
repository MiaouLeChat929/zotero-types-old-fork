// types/xpcom/libraries.d.ts — Zotero 10 Libraries namespace.
//
// Fork addition (MiaouLeChat929/zotero-types): upstream zotero-types@4.1.3
// declares Libraries but only the `userLibrary` getter, missing the main
// `get(libraryID)` lookup used by 4+ bridge sites. Runtime-verified
// (Zotero 10.0.6, /zbr/raw 2026-10-12):
//   Libraries.get(id)              → Zotero.Library | false. Runtime arity 1.
//   Libraries.getAll()             → Zotero.Library[] (sorted: My Library
//     first, then others by locale collation). Throws "cache is not
//     initialized" pre-schema init. Runtime arity 0.
//
// Sync policy: FORK-SPECIFIC. Drop when upstream adds equivalent.

declare namespace Zotero {
  namespace Libraries {
    /**
     * Look up any library (user, group, feed) by its library ID.
     * Returns the Zotero.Library object, or false if no such library is
     * known.
     * Runtime arity 1.
     */
    function get(libraryID: number): Zotero.Library | false;

    /**
     * All known libraries in the user account (personal + groups).
     * Sorted: My Library first, then others by locale-collation name.
     * Throws "Zotero.Libraries cache is not initialized" if called before
     * the schema is initialized.
     * Runtime arity 0.
     */
    function getAll(): Zotero.Library[];
  }
}
