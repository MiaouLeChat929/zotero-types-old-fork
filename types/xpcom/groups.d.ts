// types/xpcom/groups.d.ts — Zotero 10 Groups namespace.
//
// Fork addition (MiaouLeChat929/zotero-types): upstream zotero-types@4.1.3
// does not declare `Zotero.Groups` (only `Libraries` partially). The
// bridge uses 2 methods: `getAll()` and `getByLibraryID(libraryID)`.
// Both signatures derived from live runtime introspection (2026-10-12,
// /zbr/raw probes against Zotero 10.0.6).
//
// Runtime facts (Zotero 10.0.6):
//   - Groups.getAll()              → Zotero.Group[] (NOT Library[] — each
//     entry has .id, .name, ._groupID, .editable, .filesEditable).
//     The runtime wraps Library objects in Group via Zotero.Groups.wrap(),
//     adding group-specific fields. The upstream Library interface doesn't
//     expose these, so we declare Group separately.
//     Throws "Zotero.Groups cache is not initialized" if called before
//     schema init. Runtime arity 0.
//   - Groups.getByLibraryID(id)    → Zotero.Group | false. Runtime arity 1.
//
// Sync policy: FORK-SPECIFIC. Drop when upstream adds equivalent.

declare namespace Zotero {
  /**
   * A Zotero group library, with group-specific fields beyond the base
   * Library class. The runtime returns Group instances from
   * Zotero.Groups.{getAll,getByLibraryID}; they wrap Library objects
   * via Zotero.Groups.wrap().
   *
   * We declare Group as an interface (not class) so we can use
   * declaration merging with the upstream Zotero.Library class — TS
   * allows interface-merging a class, but you cannot `extends` a class
   * with an interface in the same namespace.
   */
  interface Group {
    /** Library ID (== groupID). */
    libraryID: number;
    /** Group ID. */
    id: number;
    /** Display name. */
    name: string;
    /** User description. */
    description: string;
    /** Library edition (version counter). */
    version: number;
    /** Whether the user can edit items. */
    editable: boolean;
    /** Whether the user can edit files. */
    filesEditable: boolean;
    /** Group type. */
    type: "private" | "publicOpen" | "publicClosed";
  }

  namespace Groups {
    /**
     * All groups the user has access to. Returns a sorted array of
     * Zotero.Group objects. Throws "Zotero.Groups cache is not
     * initialized" if called before the schema is initialized.
     * Runtime arity 0.
     */
    function getAll(): Zotero.Group[];

    /**
     * Look up a group by its library ID. Returns the Group object, or
     * false if no such group is known.
     * Runtime arity 1.
     */
    function getByLibraryID(libraryID: number): Zotero.Group | false;
  }
}
