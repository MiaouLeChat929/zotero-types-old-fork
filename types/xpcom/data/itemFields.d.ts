// types/xpcom/data/itemFields.d.ts — Zotero 10 ItemFields namespace.
//
// Fork addition (MiaouLeChat929/zotero-types): upstream zotero-types@4.1.3
// declares `let ItemFields: any;` in zotero.d.ts. The bridge (and 4 other
// consumers we surveyed) hit 20+ runtime methods on ItemFields. Signatures
// below are derived from LIVE probes against Zotero 10.0.6 (2026-10-12,
// execution_id 1791803397035-raw-wfmyfw0z) + the zotero source IDL.
//
// Runtime-verified facts:
//   getAll()                    → Array<{id: number, name: string}> (123 entries)
//   getName(1)                  → "title" (string)
//   getID("title")              → 1; getID("not-a-field") → false
//   getItemTypeFields(1)        → number[] (may be empty)
//   isValidForType(1, 1)        → boolean
//   isBaseField(1)              → true (boolean)
//   getLocalizedString(1)       → "Titre" (string, locale-dependent)
//   getDirection(1, 1, "en")    → "ltr" (string)
//   getBaseIDFromTypeAndField("book", 1) → 1 (number, NOT boolean despite the fn hint)
//
// Sync policy: this file is FORK-SPECIFIC. When upstream merges an
// equivalent typing, drop this file and remove the reference from
// xpcom/index.d.ts. See docs/FORK_POLICY.md.

declare namespace Zotero {
  /** Field descriptor as returned by ItemFields.getAll(). */
  interface ItemFieldEntry {
    id: number;
    name: string;
  }

  namespace ItemFields {
    /**
     * All known fields, as {id, name} objects.
     * Runtime-verified: 123 entries on Zotero 10.0.6.
     */
    function getAll(): Array<Zotero.ItemFieldEntry>;

    /**
     * Resolve a base field ID from a type-specific field.
     * @param itemType Item type NAME (e.g. "book")
     * @param typeField Type-specific field ID or name
     * @returns Base field ID (number), or false when no mapping exists.
     *   NOTE: the fn.length-based introspection reports "boolean", but live
     *   probes return a number (getBaseIDFromTypeAndField("book", 1) → 1).
     */
    function getBaseIDFromTypeAndField(
      itemType: string,
      typeField: number | string,
    ): number | false;

    /**
     * Map of field ID → base field ID for fields that differ from their base.
     */
    function getBaseMappedFields(): Record<number, number>;

    /**
     * Text direction for a field.
     * @param itemTypeID Numeric item type ID
     * @param field Numeric or named field
     * @param itemLanguage BCP-47 language tag
     */
    function getDirection(
      itemTypeID: number,
      field: number | string,
      itemLanguage: string,
    ): "rtl" | "ltr";

    /**
     * Field ID for a type+base pair.
     * @returns Field ID or false.
     */
    function getFieldIDFromTypeAndBase(
      itemType: string,
      baseField: number | string,
    ): number | false;

    /**
     * Numeric ID for a field name, or false for unknown names.
     * Runtime-verified: getID("title") → 1; getID("not-a-field") → false.
     */
    function getID(field: string): number | false;

    /**
     * All field IDs valid for an item type (includes base fields).
     * @param itemTypeID Numeric item type ID (from ItemTypes.getID).
     */
    function getItemTypeFields(itemTypeID: number): number[];

    /**
     * Localized (translated) name for a field.
     * Runtime-verified: getLocalizedString(1) → "Titre" on fr locales.
     */
    function getLocalizedString(
      field: number | string,
    ): string;

    /**
     * Machine name for a field ID.
     * Runtime-verified: getName(1) → "title".
     */
    function getName(field: number | string): string;

    /**
     * Field names that derive from a base field.
     * @param baseField Base field ID or name
     * @param asNames Return names (true) or IDs (false)
     */
    function getTypeFieldsFromBase(
      baseField: number | string,
      asNames?: boolean,
    ): Array<number | string>;

    /** Internal: load the field schema. Returns when initialized. */
    function init(): Promise<void>;

    /** Whether a field supports autocomplete. */
    function isAutocompleteField(field: number | string): boolean;

    /** Whether the field is a base field (shared across types). */
    function isBaseField(field: number | string): boolean;

    /** Whether the field is a custom user-defined field. */
    function isCustom(fieldID: number | string): boolean;

    /** Whether the field stores a date value. */
    function isDate(field: number | string): boolean;

    /** Whether a type-specific field derives from a base field. */
    function isFieldOfBase(
      field: number | string,
      baseField: number | string,
    ): boolean;

    /** Whether the field stores an integer. */
    function isInteger(fieldID: number | string): boolean;

    /** Whether the field is a long-form text field. */
    function isLong(field: number | string): boolean;

    /** Whether the field accepts multiline input. */
    function isMultiline(field: number | string): boolean;

    /**
     * Whether a field is valid for an item type.
     * @param fieldID Field ID or name
     * @param itemTypeID NUMERIC item type ID (runtime-verified: strings
     *   don't match — ItemTypes.getID() output feeds this).
     */
    function isValidForType(
      fieldID: number | string,
      itemTypeID: number,
    ): boolean;
  }
}
