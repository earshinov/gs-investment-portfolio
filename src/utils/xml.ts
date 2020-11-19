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
