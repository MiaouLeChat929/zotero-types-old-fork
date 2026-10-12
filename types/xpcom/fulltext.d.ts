/// <reference path="data/item.d.ts" />

declare namespace _ZoteroTypes {
  interface FullText {
    readonly fulltextCacheFile: ".zotero-ft-cache";

    readonly INDEX_STATE_UNAVAILABLE: 0;
    readonly INDEX_STATE_UNINDEXED: 1;
    readonly INDEX_STATE_PARTIAL: 2;
    readonly INDEX_STATE_INDEXED: 3;
    readonly INDEX_STATE_QUEUED: 4;
    readonly INDEX_STATE_UPDATING: 5;

    readonly SYNC_STATE_UNSYNCED: 0;
    readonly SYNC_STATE_IN_SYNC: 1;
    readonly SYNC_STATE_TO_PROCESS: 2;
    readonly SYNC_STATE_TO_DOWNLOAD: 3;
    readonly SYNC_STATE_MISSING: 4;

    // ── Core lifecycle (existing) ─────────────────────────────────────
    init(): Promise<void>;
    setPDFConverterPath(path: string): void;
    setPDFInfoPath(path: string): void;
    setPDFDataPath(path: string): void;
    getLibraryVersion(libraryID: number): Promise<number>;
    setLibraryVersion(libraryID: number, version: number): Promise<void>;
    clearLibraryVersion(libraryID: number): Promise<void>;
    getItemVersion(itemID: number): Promise<number>;
    setItemSynced(itemID: number, version: number): Promise<void>;
    getPDFConverterExecAndArgs(): { exec: string; args: string[] };
    isCachedMIMEType(mimeType: string): boolean;
    indexItems(
      itemIDs: number | number[],
      options?: { complete?: boolean; ignoreErrors?: boolean },
    ): Promise<void>;
    rebuildIndex(unindexedOnly: boolean): Promise<void>;
    clearIndex(skipLinkedURLs?: boolean): Promise<void>;
    purgeUnusedWords(): Promise<void>;
    canIndex(item: Zotero.Item): boolean;
    canReindex(item: Zotero.Item): Promise<boolean>;
    getIndexedState(item: Zotero.Item): Promise<number>;
    isFullyIndexed(item: Zotero.Item): Promise<boolean>;
    getIndexStats(): Promise<{
      indexed: number;
      partial: number;
      unindexed: number;
      words: number;
    }>;
    getItemCacheFile(item: Zotero.Item): nsIFile;
    getItemProcessorCacheFile(item: Zotero.Item): nsIFile;
    transferItemIndex(
      fromItem: Zotero.Item,
      toItem: Zotero.Item,
    ): Promise<void>;

    // ── Note + attachment index queues (fork addition) ────────────────
    // Runtime-verified against Zotero 10.0.6 via /zbr/raw (2026-10-12).
    // Arity is `fn.length` from the live functions.

    /**
     * Mark a note as needing reindex. Adds (itemID, 0) to
     * ftindex.fulltextNoteIndexState and caches the note text. Async.
     * Runtime arity: 2.
     */
    flagNoteStale(itemID: number, note: string): Promise<void>;

    /**
     * Mark a single attachment as needing reindex. Async. Runtime arity 1.
     */
    flagAttachmentStale(itemID: number): Promise<void>;

    /**
     * Drain the note index queue. Returns the number of items processed.
     * If a sync is in progress, returns the partial count. Runtime arity 0
     * (the {maxTime, checkIdle, onProgress} options are an optional object
     * destructured in the body — fn.length is 0).
     */
    processNoteIndexQueue(options?: {
      maxTime?: number | null;
      checkIdle?: boolean;
      onProgress?: ((processed: number) => void) | null;
    }): Promise<number>;

    /**
     * Drain the attachment index queue. Same shape as processNoteIndexQueue.
     * Runtime arity 0.
     */
    processAttachmentIndexQueue(options?: {
      maxTime?: number | null;
      checkIdle?: boolean;
      onProgress?: ((processed: number) => void) | null;
    }): Promise<number>;

    /**
     * Count of notes still needing (re)indexing. Runtime arity 0.
     */
    getNoteIndexQueueCount(): Promise<number>;

    /**
     * Count of attachments still needing (re)indexing. Runtime arity 0.
     */
    getAttachmentIndexQueueCount(): Promise<number>;

    // ── Content extraction (fork note) ────────────────────────────────
    /**
     * Read cached pages of an indexed item.
     * KNOWN BROKEN in Zotero 10.0.6 (services/text.ts:114-116) — always
     * throws mozIStorageValueArray error. Returns false on failure.
     * Runtime arity 1.
     */
    getPages(itemID: number): Promise<false | { total: number }>;

    // ── Indexing operations (existing) ───────────────────────────────
    indexDocument(document: Document, itemID: number): Promise<boolean | void>;
    indexPDF(
      filePath: string,
      itemID: number,
      allPages?: boolean,
    ): Promise<boolean>;
    indexEPUB(
      filePath: string,
      itemID: number,
      allText?: boolean,
    ): Promise<boolean>;
    indexFromProcessorCache(itemID: number): Promise<boolean>;
    clearItemWords(itemID: number, force?: boolean): Promise<void>;
    semanticSplitter(text: string, charset?: string): string[];

    // ── Search (existing) ────────────────────────────────────────────
    /**
     * Cross-PDF content search. Runtime arity 3.
     *
     * EBM (Zotero 10.0.6, /zbr/raw 2026-10-12): signature is
     * `async function (items, searchText, mode)`. ARGUMENT ORDER IS
     * items-FIRST, searchText-SECOND — NOT the (searchText, items) order
     * that a misleading doc comment claimed earlier. The bridge calls it as
     * `findTextInItems(ids, text)` (services/fulltext.ts:327).
     *
     * Runtime behavior (from the live function body):
     *   - `items` is an array of itemIDs (or items); resolved via
     *     `Zotero.Items.getAsync(items)` internally, so NUMERIC IDs are the
     *     safe input (item objects get stringified to NaN in the sandbox).
     *   - `searchText` plain text or regex.
     *   - `mode` is a STRING, not an options object: it is scanned for the
     *     substring "Binary" to toggle binary (non-text MIME) scanning.
     *   - Returns `Array<{ id: number }>` — a flat list of matched
     *     attachment itemIDs. NO `combined` / `contexts` fields; that was
     *     a hallucinated shape from an earlier draft.
     */
    findTextInItems(
      items: number[] | Zotero.Item[],
      searchText: string,
      mode?: string,
    ): Promise<Array<{ id: number }>>;
  }
}
declare namespace Zotero {
  const Fulltext: _ZoteroTypes.FullText;
  const FullText: _ZoteroTypes.FullText;
}
