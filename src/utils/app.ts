const RE_MARKS = /'+$/;

export function stripMarks(symbol: string): string {
  return symbol.replace(RE_MARKS, '');
}
