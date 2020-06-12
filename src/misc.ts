export function normalizeCurrency(currency: string): string {
  return currency === 'SUR' ? 'RUB' : currency;
}

export function convertToRub(price1: number|'', price2: number|'', currency: string, usdrub: number): number|'' {
  const priceInCurrency = getPriceInCurrency(price1, price2);
  if (priceInCurrency === '')
    return '';

  let priceInRub: number;
  switch (currency) {
    case 'USD':
      priceInRub = priceInCurrency * usdrub;
      break;
    case 'RUB':
      priceInRub = priceInCurrency;
      break;
    default:
      throw new Error(`Don't know how to handle currency ${currency}`);
  }

  return priceInRub;
}

export function convertToUsd(price1: number|'', price2: number|'', currency: string, usdrub: number): number|'' {
  const priceInCurrency = getPriceInCurrency(price1, price2);
  if (priceInCurrency === '')
    return '';

  let priceInUsd: number;
  switch (currency) {
    case 'USD':
      priceInUsd = priceInCurrency;
      break;
    case 'RUB':
      priceInUsd = priceInCurrency / usdrub;
      break;
    default:
      throw new Error(`Don't know how to handle currency ${currency}`);
  }

  return priceInUsd;
}

/**
 * Calculates a price for bonds or stock.
 *
 * For bonds, the function should be given
 *   - `price1` - bond price, e.g. 1.0017 corresponding to 100.17% of bond face value
 *   - `price2` - bond face value
 *
 * For stocks, the function should be given
 *   - `price1` == "" (empty stylesheet cell)
 *   - `price2` - stock price
 *
 * The function also handles `price2` == "" (empty stylesheet cell), returning "".
 */
export function getPriceInCurrency(price1: number|'', price2: number|''): number|'' {
  if (price2 === '')
    return '';

  let priceInCurrency: number;
  if (price1 !== '') {
    const bondPrice = price1;
    const bondFaceValue = price2;
    priceInCurrency = bondPrice * bondFaceValue;
  }
  else {
    const stockPrice = price2;
    priceInCurrency = stockPrice;
  }
  return priceInCurrency;
}
