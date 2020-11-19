export function fetchJson(url: string): unknown {
  const response = UrlFetchApp.fetch(url);
  return JSON.parse(response.getContentText());
}
