import { normalizeCurrency } from '.';

test('normalizeCurrency', () => {
  expect(normalizeCurrency('USD')).toBe('USD');
  expect(normalizeCurrency('EUR')).toBe('EUR');
  expect(normalizeCurrency('RUB')).toBe('RUB');
  expect(normalizeCurrency('SUR')).toBe('RUB');
});
