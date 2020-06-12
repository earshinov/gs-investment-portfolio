export function normalizeCurrency(currency: string): string {
  return currency === 'SUR' ? 'RUB' : currency;
}
