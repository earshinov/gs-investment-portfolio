import { fetchJson, stripMarks } from './utils';

export namespace yahoo {

  // #region getPrice

  export type Price = number;

  type PriceCache = {[symbol: string]: Price};

  const PRICE_CACHE: PriceCache = {};

  /**
   * Get the latest price for the given ticket from Yahoo.Finance, possibly from cache.
   *
   * @example
   * ```typescript
   * yahoo.finance('AAPL')
   * yahoo.finance('MCX:OBUV')
   * ```
   *
   * References:
   *   - https://habr.com/ru/post/505674/
   */
  export function getPrice(symbol: string): Price {
    symbol = translateSymbol(stripMarks(symbol));

    let price: Price;
    if (PRICE_CACHE.hasOwnProperty(symbol))
      price = PRICE_CACHE[symbol];
    else {
      price = fetchPrice(symbol);
      PRICE_CACHE[symbol] = price;
    }
    return price;
  }

  function fetchPrice(symbol: string): Price {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=price`;
    const json = fetchJson(url) as any;
    return json.quoteSummary.result[0].price.regularMarketPrice.raw as number;
  }

  // #endregion

  // #region getSector

  export interface SectorAndIndustry {
    sector: string;
    industry: string;
  }

  type SectorCache = {[symbol: string]: SectorAndIndustry};

  const SECTOR_CACHE: SectorCache = {};

  /**
   * Get S&P sector and industry by symbol, possibly from cache.
   *
   * @example
   * ```typescript
   * yahoo.getSector('OBUV.ME').sector  // == "Consumer Cyclical"
   * yahoo.getSector('OBUV.ME').industry  // == "Footwear & Accessories"
   * ```
   */
  export function getSector(symbol: string): SectorAndIndustry {
    symbol = translateSymbol(stripMarks(symbol));

    let data: SectorAndIndustry;
    if (SECTOR_CACHE.hasOwnProperty(symbol))
      data = SECTOR_CACHE[symbol];
    else {
      data = fetchSector(symbol);
      SECTOR_CACHE[symbol] = data;
    }
    return data;
  }

  function fetchSector(symbol: string): SectorAndIndustry {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=assetProfile`;
    const json = fetchJson(url) as any;
    const { sector, industry } = json.quoteSummary.result[0].assetProfile;
    return { sector, industry };
  }

  // #endregion

  const RE_MCX = /^MCX:(.*)$/i;

  /**
   * Translates symbol name from GOOGLEFINANCE format to Yahoo.Finance format.
   *
   * @example
   * ```typescript
   * yahoo.translateSymbol('MCX:OBUV')  // == 'OBUV.ME'
   * ```
   */
  // export for tests
  export function translateSymbol(symbol: string) {
    const mcxMatch = RE_MCX.exec(symbol);
    if (mcxMatch)
      return `${mcxMatch[1]}.ME`;

    return symbol;
  }
}
