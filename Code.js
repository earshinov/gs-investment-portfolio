function normalizeCurrency(currency) {
  return currency === 'SUR' ? 'RUB' : currency;
}

// https://habr.com/ru/post/486716/
function moexFetchSecurity(market, boardId, securityId, attributeName) {
  if (!boardId || typeof boardId !== "string")
    throw new Error("Invalid boardId: " + boardId);
  if (!securityId || typeof securityId !== "string")
    throw new Error("Invalid securityId: " + securityId);
  if (!attributeName || typeof attributeName !== "string")
    throw new Error("Invalid attributeName: " + attributeName);
  
  const baseUrl = "https://iss.moex.com/iss/engines/stock/markets/" + market + "/boards/" + boardId + "/securities/" + securityId + ".xml";
  const query = "?iss.meta=off&iss.only=securities&securities.columns=SECID," + attributeName;
  const url = baseUrl + query;
  
  const xmlFeed = UrlFetchApp.fetch(url);
  const xml = xmlFeed.getContentText();
  const xmlDoc = XmlService.parse(xml);
  
  let ret = null;
  const found = xmlDoc.getRootElement().getChildren().some(function(data) {
    if (data.getName() === "data" && data.getAttribute("id") && data.getAttribute("id").getValue() === "securities") {
      return data.getChild("rows").getChildren().some(function(row) {
        if (row.getName() === "row" && row.getAttribute("SECID") && row.getAttribute("SECID").getValue() === securityId) {
          if (!row.getAttribute(attributeName))
            throw new Error("No such attribute: " + attributeName);
          ret = row.getAttribute(attributeName).getValue();
          return true;
        }
      });
    }
  });
  if (!found)
    throw new Error("Not Found");
  return ret;
}

function test_moexFetchSecurity() {
  //moexFetchSecurity("bonds", "EQOB", "RU000A0JWSQ7", "FACEVALUE");
  moexFetchSecurity("bonds", "TQCB", "RU000A0JWSQ7", "PREVPRICE")
}
