// types/xpcom/data/itemFields.d.ts — Zotero 10 ItemFields namespace.
//
// Fork addition (MiaouLeChat929/zotero-types): upstream zotero-types@4.1.3
// declares `let ItemFields: any;` in zotero.d.ts because the runtime methods
// are too dynamic to type. The bridge (and 4 other consumers we surveyed)
// hit 20+ runtime methods on ItemFields; we provide signatures derived from
// the live Zotero 10.0.6 runtime + MDN docs + the IDL zotero source.
//
// Sync policy: this file is FORK-SPECIFIC. When upstream merges an
// equivalent PR, drop this file and remove the reference from
// xpcom/index.d.ts. See docs/FORK_POLICY.md.

declare namespace Zotero {
  namespace ItemFields {
    /**
     * Get the localized field name for a field ID, optionally scoped to
     * a specific item type.
     *
     * @param fieldID Numeric field ID (1-based, see Zotero.ItemFields.getID)
     * @param itemType Optional item type name to get a type-specific name
     * @returns Localized field name
     */
    function getName(fieldID: number, itemType?: string): string;

    /**
     * Get the numeric ID for a field name, optionally scoped to an item type.
     *
     * @param field Field name (e.g. "title", "date", "abstractNote")
     * @param itemType Optional item type name
     * @returns Field ID, or false if the field doesn't exist for that type
     */
    function getID(field: string, itemType?: string): number | false;

    /**
     * Test whether a field name or ID is valid for a given item type.
     */
    function isValidForType(
      field: string | number,
      itemType: string,
    ): boolean;

    /**
     * Test whether a field stores an integer value.
     */
    function isInteger(
      field: string | number,
      itemType?: string,
    ): boolean;

    /**
     * Get all field IDs valid for a given item type, including base fields.
     */
    function getItemTypeFields(itemType: string): number[];

    /**
     * Test whether a field is a base field (defined for all types).
     */
    function isBaseField(
      baseField: number,
      itemType?: string,
    ): boolean;

    /**
     * Test whether a field is a derived field of a base field, for a type.
     */
    function isFieldOfBase(
      field: number,
      baseField: number,
      itemType: string,
    ): boolean;

    /**
     * Resolve the field ID that maps a base field for a given type.
     * Returns false if no such mapping exists.
     */
    function getFieldIDFromTypeAndBase(
      itemType: string,
      baseField: number,
    ): number | false;

    /**
     * Reverse lookup: given a type+field, find the base field ID.
     */
    function getBaseIDFromTypeAndField(
      itemType: string,
      field: number | string,
    ): number | false;

    /**
     * Get all item-type field IDs that derive from a given base field.
     */
    function getTypeFieldsFromBase(baseField: number): number[];

    /**
     * List all field names (or IDs) known to Zotero.
     */
    function getAll(itemType?: string): string[];

    /**
     * Get the localized string for a field (vs. its machine name).
     */
    function getLocalizedString(
      field: number | string,
      itemType?: string,
    ): string;

    /**
     * Test whether a field stores a date value.
     */
    function isDate(
      field: number | string,
      itemType?: string,
    ): boolean;

    /**
     * Test whether a field is a custom user-defined field.
     */
    function isCustom(field: number | string): boolean;

    /**
     * For a given item type, return the map of base field ID → derived
     * field ID. Fields that map to themselves are omitted.
     */
    function getBaseMappedFields(
      itemType: string,
    ): Record<number, number>;

    /**
     * Test whether a field supports autocomplete.
     */
    function isAutocompleteField(
      field: number | string,
      itemType?: string,
    ): boolean;

    /**
     * Test whether a field is a long-form text field.
     */
    function isLong(
      field: number | string,
      itemType?: string,
    ): boolean;

    /**
     * Test whether a field accepts multiple lines.
     */
    function isMultiline(
      field: number | string,
      itemType?: string,
    ): boolean;

    /**
     * Text direction ("rtl" or "ltr") for a field.
     */
    function getDirection(
      field: number | string,
      itemType?: string,
    ): "rtl" | "ltr";
  }
}
