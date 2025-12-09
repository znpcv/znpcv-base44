/**
 * Trading Economics API Integration
 * 
 * SETUP:
 * 1. Account erstellen auf: https://tradingeconomics.com/api
 * 2. API Key holen (kostenloser Plan verfügbar)
 * 3. Secrets in Base44 Dashboard setzen: TRADING_ECONOMICS_API_KEY
 * 
 * Features:
 * - Economic Calendar Events (Live)
 * - Real-time Forex Prices
 * - Market News
 * - Historical Data
 */

export default async function fetchTradingEconomics({ type, params, apiKey }) {
  const API_KEY = apiKey || process.env.TRADING_ECONOMICS_API_KEY;
  
  if (!API_KEY) {
    return {
      success: false,
      error: 'Trading Economics API Key fehlt. Bitte in Dashboard Secrets setzen.',
      data: null
    };
  }

  const BASE_URL = 'https://api.tradingeconomics.com';

  try {
    let endpoint = '';
    
    switch(type) {
      case 'calendar':
        // Economic Calendar Events
        // https://api.tradingeconomics.com/calendar?c=guest:guest&d1=2025-12-01&d2=2025-12-31
        const startDate = params?.startDate || new Date().toISOString().split('T')[0];
        const endDate = params?.endDate || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];
        endpoint = `/calendar?c=${API_KEY}&d1=${startDate}&d2=${endDate}`;
        if (params?.country) endpoint += `&country=${params.country}`;
        if (params?.importance) endpoint += `&importance=${params.importance}`;
        break;
        
      case 'markets':
        // Live Market Prices (Forex, Commodities, etc)
        // https://api.tradingeconomics.com/markets/symbol/eurusd:cur?c=guest:guest
        const symbol = params?.symbol || 'eurusd:cur';
        endpoint = `/markets/symbol/${symbol}?c=${API_KEY}`;
        break;
        
      case 'news':
        // Latest Market News
        // https://api.tradingeconomics.com/news?c=guest:guest&limit=10
        const limit = params?.limit || 20;
        endpoint = `/news?c=${API_KEY}&limit=${limit}`;
        if (params?.country) endpoint += `&country=${params.country}`;
        break;
        
      case 'indicators':
        // Economic Indicators
        // https://api.tradingeconomics.com/country/united%20states?c=guest:guest
        const country = params?.country || 'united states';
        endpoint = `/country/${encodeURIComponent(country)}?c=${API_KEY}`;
        break;
        
      default:
        return {
          success: false,
          error: 'Invalid type. Use: calendar, markets, news, or indicators',
          data: null
        };
    }

    const response = await fetch(`${BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`Trading Economics API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data,
      type: type,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Trading Economics fetch error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * VERWENDUNG IN FRONTEND:
 * 
 * // Economic Calendar
 * const calendar = await base44.functions.fetchTradingEconomics({
 *   type: 'calendar',
 *   params: { 
 *     startDate: '2025-12-09',
 *     endDate: '2025-12-16',
 *     country: 'united states,germany,japan',
 *     importance: 3  // High impact only
 *   }
 * });
 * 
 * // Live Forex Price
 * const price = await base44.functions.fetchTradingEconomics({
 *   type: 'markets',
 *   params: { symbol: 'eurusd:cur' }
 * });
 * 
 * // Latest News
 * const news = await base44.functions.fetchTradingEconomics({
 *   type: 'news',
 *   params: { limit: 10, country: 'united states' }
 * });
 */