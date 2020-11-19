export function getNamedRange(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, name: string): GoogleAppsScript.Spreadsheet.NamedRange | undefined {
  return spreadsheet.getNamedRanges().find(range => range.getName() === name);
}

export function areEqualRanges(a: GoogleAppsScript.Spreadsheet.Range, b: GoogleAppsScript.Spreadsheet.Range): boolean {
  return a.getA1Notation() === b.getA1Notation();
}
