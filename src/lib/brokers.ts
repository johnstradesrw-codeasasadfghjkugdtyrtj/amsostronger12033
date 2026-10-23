export const BROKERS = [
  "XM", "Exness", "IC Markets", "Pepperstone", "HFM", "RoboForex", "FBS", "FxPro",
  "Tickmill", "Vantage", "Eightcap", "Axi", "FP Markets", "Fusion Markets",
  "BlackBull Markets", "JustMarkets", "Admirals", "ActivTrades", "Deriv", "OANDA",
  "Alpari", "FOREX.com", "CMC Markets", "ThinkMarkets", "VT Markets",
  "Moneta Markets", "PU Prime", "IUX", "Octa", "FXCM", "FXOpen", "FXTM", "HYCM",
  "InstaForex", "Swissquote", "Dukascopy", "Capital.com", "Saxo", "GO Markets",
  "Global Prime", "Trade Nation", "Markets.com", "Libertex", "NAGA", "Skilling",
  "FIBO Group", "Key to Markets", "Axiory", "Orbex", "AvaTrade", "IronFX",
  "Windsor Brokers", "AETOS", "BDSwiss", "easyMarkets", "ACY Securities", "TMGM",
  "Trive", "Blueberry Markets", "DNA Markets", "FPFX", "Blackwell Global",
  "Amana", "MultiBank Group", "ATFX", "FXGT", "GMI Markets", "Land-FX",
  "M4Markets", "Tradeview Markets", "Hirose Financial", "PhillipCapital",
  "Sucden Financial", "City Index", "Interactive Brokers", "IG", "Plus500",
  "eToro", "XTB", "Trading 212", "Binance", "Bybit", "Bitget", "KuCoin", "MEXC",
] as const;

export function searchBrokers(query: string, limit = 12): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return BROKERS.slice(0, limit);
  return BROKERS.filter((b) => b.toLowerCase().includes(q)).slice(0, limit);
}
