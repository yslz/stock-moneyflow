const axios = require('axios');

const SECTORS = {
  'XLK': 'Technology',
  'XLV': 'Health Care',
  'XLF': 'Financial',
  'XLY': 'Consumer Cyclical',
  'XLP': 'Consumer Defensive',
  'XLI': 'Industrials',
  'XLU': 'Utilities',
  'XLB': 'Basic Materials',
  'XLRE': 'Real Estate',
  'XLC': 'Communication Svcs',
  'XLE': 'Energy'
};

exports.handler = async () => {
  try {
    const sectors = [];
    for (const [sym, name] of Object.entries(SECTORS)) {
      try {
        const res = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`, { 
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } 
        });
        const m = res.data.chart.result[0]?.meta;
        if (m) {
          const open = m.previousClose || m.chartPreviousClose;
          const close = m.regularMarketPrice || m.previousClose;
          const changePct = open ? (((close - open) / open) * 100) : 0;
          sectors.push({ 
            symbol: sym, 
            name: name, 
            price: parseFloat(close.toFixed(2)), 
            change_pct: parseFloat(changePct.toFixed(2)) 
          });
        }
      } catch(e) {
        console.error(`${sym} failed:`, e.message);
      }
    }
    const sorted = sectors.sort((a,b) => b.change_pct - a.change_pct);
    const ranking = sorted.map((s,i) => ({ 
      rank: i+1, 
      symbol: s.symbol, 
      name: s.name, 
      price: s.price, 
      change_pct: s.change_pct 
    }));
    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        date: new Date().toLocaleString('zh-CN', { timeZone: 'America/New_York' }), 
        market: '美股', 
        ranking 
      }, null, 2),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    };
  } catch(e) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: e.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
