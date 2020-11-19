import { cache } from './cache';
import { stripMarks } from './utils/app';
import { fetchJson } from './utils/json';

export namespace yahoo {

  // #region getPrice

  export type Price = number;

  type PriceBySymbol = {[symbol: string]: Price};

  class PriceDocumentCache extends cache.SerializingDocumentCache<PriceBySymbol> {

    protected serializeValue(symbol: string, value: number): string {
      return value.toString();
    }

    protected deserializeValue(symbol: string, serializedValue: string): number {
      return Number(serializedValue);
    }
  }

  const PRICE_CACHE = new cache.MemoryCache<PriceBySymbol>(
    new PriceDocumentCache(
      cache.NullCache.instance
    ),
    {}
  );

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

    let result = PRICE_CACHE.get(symbol);
    if (result == null) {
      result = fetchPrice(symbol);
      PRICE_CACHE.put(symbol, result);
    }
    return result;
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

  type SectorAndIndustryBySymbol = {[symbol: string]: SectorAndIndustry};

  const SECTOR_CACHE = cache.newDefaultJsonCache<SectorAndIndustryBySymbol>({});

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

    let result = SECTOR_CACHE.get(symbol);
    if (result == null) {
      result = fetchSector(symbol);
      SECTOR_CACHE.put(symbol, result);
    }
    return result;
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
