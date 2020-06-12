function normalizeCurrency(currency) {
  return F.normalizeCurrency(currency);
}

function convertToRub(price1, price2, currency, usdrub) {
  return F.convertToRub(price1, price2, currency, usdrub);
}

function convertToUsd(price1, price2, currency, usdrub) {
  return F.convertToUsd(price1, price2, currency, usdrub);
}

function getPriceInCurrency(price1, price2) {
  return F.getPriceInCurrency(price1, price2);
}

function moex(url, attributeName) {
  return F.moex.getSecurityInfo(url, attributeName);
}

function moexIsin(isin, attributeName) {
  return F.moex.getSecurityInfoByIsin(isin, attributeName);
}

function yahooFinance(symbol) {
  return F.yahoo.getPrice(symbol);
}

function yahooSector(symbol) {
  return F.yahoo.getSector(symbol).sector;
}

function yahooIndustry(symbol) {
  return F.yahoo.getSector(symbol).industry;
}
