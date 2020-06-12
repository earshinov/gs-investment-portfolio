/**
 * Lookup something in an array.
 */
export function lookup<T1, T2>(arr: T1[], predicate: (item: T1) => T2 | undefined): T2 | undefined {
  let ret: T2 | undefined;
  arr.some(item => {
    const candidate = predicate(item);
    if (candidate !== undefined) {
      ret = candidate;
      return true;
    }
  })
  return ret;
}

// #region XML

export function fetchXml(url: string) {
  const response = UrlFetchApp.fetch(url);
  const xmlText = response.getContentText();
  const xmlDoc = XmlService.parse(xmlText);
  return [xmlText, xmlDoc] as const;
}

export type AttributesDict = {[name: string]: string};

export function getXmlAttributesDict(el: GoogleAppsScript.XML_Service.Element): AttributesDict {
  const data: AttributesDict = {};
  for (const attr of el.getAttributes())
    data[attr.getName()] = attr.getValue();
  return data;
}

// #endregion

// #region JSON

export function fetchJson(url: string): unknown {
  const response = UrlFetchApp.fetch(url);
  return JSON.parse(response.getContentText());
}

// #endregion
