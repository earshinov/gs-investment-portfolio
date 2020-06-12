import { yahoo } from './yahoo';

test('yahoo.translateSymbol', () => {
  expect(yahoo.translateSymbol('AAPL')).toBe('AAPL');
  expect(yahoo.translateSymbol('MCX:OBUV')).toBe('OBUV.ME');
});
