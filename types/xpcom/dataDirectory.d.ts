// types/xpcom/dataDirectory.d.ts — Zotero 10 DataDirectory namespace.
//
// Fork addition (MiaouLeChat929/zotero-types): upstream zotero-types@4.1.3
// does not declare `Zotero.DataDirectory` at all. The bridge needs:
//   - dir: string   (the user's data dir path; declared in upstream zbr/types?)
//   - getDatabase(name?: string, ext?: string): string   (path to a DB file)
//
// Runtime-verified (Zotero 10.0.6, /zbr/raw 2026-10-12):
//   getDatabase()            → "<dir>/zotero.sqlite"
//   getDatabase("foo")       → "<dir>/foo.sqlite"
//   getDatabase("foo", "db") → "<dir>/foo.db"
//
// Sync policy: FORK-SPECIFIC. Drop when upstream adds equivalent.

declare namespace Zotero {
  namespace DataDirectory {
    /** Path to the user's Zotero profile data directory. */
    let dir: string;

    /**
     * Path to a database file inside the data directory.
     * @param name File basename (default: "zotero"). Appended ".sqlite" by default.
     * @param ext Extension override (default: "sqlite").
     * @returns Absolute path (Zotero's data dir + name + ext).
     * Runtime arity 2.
     */
    function getDatabase(name?: string, ext?: string): string;
  }
}
