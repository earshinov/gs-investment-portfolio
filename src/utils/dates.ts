export function stripTime(date: Date): Date {
  return new Date(date.getDate(), date.getMonth(), date.getFullYear());
}
