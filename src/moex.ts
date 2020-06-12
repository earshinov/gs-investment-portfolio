import { lookup, fetchXml, getXmlAttributesDict } from './utils';

export namespace moex {

  /**
   * Gets security info from MOEX API, possibly from cache.
   *
   * @example
   * ```typescript
   * moex.getSecurityInfoByIsin('RU000A0JWSQ7', 'PREVPRICE');
   * ```
   *
   * References:
   *   - https://habr.com/ru/post/486716/
   */
  export function getSecurityInfoByIsin(isin: string, attributeName: string): string {
    const basicInfo = getBasicSecurityInfoByIsin(isin);

    let marketName: string;
    if (basicInfo['group'] === 'stock_bonds')
      marketName = 'bonds';
    else
      throw new Error(`Could not determine market name for security ${JSON.stringify(basicInfo)}`);

    const boardId = basicInfo['primary_boardid'];
    if (!boardId)
      throw new Error(`Could not determine board id for security ${JSON.stringify(basicInfo)}`);

    const securityId = basicInfo['secid'];
    if (!securityId)
      throw new Error(`Could not determine SECID for security ${JSON.stringify(basicInfo)}`);

    const url = `https://iss.moex.com/iss/engines/stock/markets/${marketName}/boards/${boardId}/securities/${securityId}.xml`;
    return getSecurityInfo(url, attributeName);
  }

  type BasicSecurityInfo = {[key: string]: string};

  type BasicSecurityInfoByIsinCache = {[url: string]: BasicSecurityInfo};

  const BASIC_SECURITY_INFO_BY_ISIN_CACHE: BasicSecurityInfoByIsinCache = {};

  function getBasicSecurityInfoByIsin(isin: string): BasicSecurityInfo {
    let data: BasicSecurityInfo;
    if (BASIC_SECURITY_INFO_BY_ISIN_CACHE.hasOwnProperty(isin))
      data = BASIC_SECURITY_INFO_BY_ISIN_CACHE[isin];
    else {
      data = fetchBasicSecurityInfoByIsin(isin);
      BASIC_SECURITY_INFO_BY_ISIN_CACHE[isin] = data;
    }
    return data;
  }

  function fetchBasicSecurityInfoByIsin(isin: string): BasicSecurityInfo {
    const url = `https://iss.moex.com/iss/securities.xml?iss.meta=off&iss.only=securities&q=${encodeURIComponent(isin)}`;
    const [xmlText, xmlDoc] = fetchXml(url);

    const row = lookup(xmlDoc.getRootElement().getChildren(), data => {
      if (data.getName() === 'data' && data.getAttribute('id') && data.getAttribute('id').getValue() === 'securities')
        return lookup(data.getChild('rows').getChildren(), row => {
          if (row.getName() === 'row' && row.getAttribute('isin') && row.getAttribute('isin').getValue() === isin)
            return row;
        });
    });
    if (!row)
      throw new Error(`Search for isin='${isin}' failed: ${xmlText}`);
    return getXmlAttributesDict(row);
  }

  export type SecurityInfo = {[key: string]: string};

  type SecurityInfoCache = {[url: string]: SecurityInfo};

  const SECURITY_INFO_CACHE: SecurityInfoCache = {};

  /**
   * Gets security info from MOEX API, possibly from cache.
   *
   * @param url MOEX API security URL
   *
   * @example
   * ```typescript
   * moex.getSecurityInfo('https://iss.moex.com/iss/engines/stock/markets/bonds/boards/TQCB/securities/RU000A0JWSQ7.xml', 'PREVPRICE');
   * ```
   *
   * References:
   *   - https://habr.com/ru/post/486716/
   */
  export function getSecurityInfo(url: string, attributeName: string): string {
    let data: SecurityInfo;
    if (SECURITY_INFO_CACHE.hasOwnProperty(url))
      data = SECURITY_INFO_CACHE[url];
    else {
      data = fetchSecurityInfo(url);
      SECURITY_INFO_CACHE[url] = data;
    }

    if (!data.hasOwnProperty(attributeName))
      throw new Error(`No attribute ${attributeName} in security info ${JSON.stringify(data)}`);
    return data[attributeName];
  }

  function fetchSecurityInfo(url: string) {
    const securityId = extractSecurityId(url);
    const [xmlText, xmlDoc] = fetchXml(url + '?iss.meta=off&iss.only=securities');

    const row = lookup(xmlDoc.getRootElement().getChildren(), data => {
      if (data.getName() === 'data' && data.getAttribute('id') && data.getAttribute('id').getValue() === 'securities')
        return lookup(data.getChild('rows').getChildren(), row => {
          if (row.getName() === 'row' && row.getAttribute('SECID') && row.getAttribute('SECID').getValue() === securityId)
            return row;
        });
    });
    if (!row)
      throw new Error(`Did not find security info for securityId='${securityId}' in ${xmlText}`);
    return getXmlAttributesDict(row);
  }

  const RE_SECURITY_URL = /.*\/(.*)\.xml$/;
  function extractSecurityId(url: string): string {
    const match = RE_SECURITY_URL.exec(url);
    if (!match)
      throw new Error(`Cannot extract security id from url='${url}'.  Expected something like 'https://iss.moex.com/iss/engines/stock/markets/bonds/boards/TQCB/securities/RU000A0JWSQ7.xml'`);
    return match[1];
  }
}
