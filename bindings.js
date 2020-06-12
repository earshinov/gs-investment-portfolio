function normalizeCurrency(currency) {
  return F.normalizeCurrency(currency);
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
