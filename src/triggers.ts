import { cache } from './cache';
import { areEqualRanges, getNamedRange } from './utils/spreadsheets';

export namespace triggers {

  /**
   * Bind this function to the Edit event (Script Editor > Edit > Current project's triggers)
   */
  export function onEdit(e: TriggerEditEvent): void {
    const checked = e.range.isChecked();
    if (checked != null) {
      // A boolean flag

      const useDocumentCacheNamedRange = getNamedRange(SpreadsheetApp.getActiveSpreadsheet(), 'useDocumentCache');
      if (useDocumentCacheNamedRange && areEqualRanges(e.range, useDocumentCacheNamedRange.getRange())) {

        cache.useDocumentCache = e.value as boolean;
      }
    }
  }
}
