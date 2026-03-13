const axios = require('axios');

const SECTOR_ETFS = {
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

exports.handler = async (event, context) => {
  try {
    const sectors = [];

    // 获取每个板块 ETF 的数据
    for (const [symbol, name] of Object.entries(SECTOR_ETFS)) {
      try {
        const res = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, { 
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } 
        });
        const m = res.data.chart.result[0]?.meta;
        if (m) {
          const open = m.previousClose || m.chartPreviousClose;
          const close = m.regularMarketPrice || m.previousClose;
          const changePct = open ? (((close - open) / open) * 100) : 0;
          const volume = m.regularMarketVolume || 0;
          
          // 估算资金流（成交量 * 平均价格）= 美元，不转换
          const estimatedFlow = volume * close;
          
          sectors.push({ 
            symbol: symbol, 
            name: name, 
            net_money: parseFloat(estimatedFlow.toFixed(2)),
            change_pct: parseFloat(changePct.toFixed(2)),
            volume: volume,
            price: parseFloat(close.toFixed(2))
          });
        }
      } catch(e) {
        console.error(`${symbol} failed:`, e.message);
      }
    }

    // 按净流入排序
    const sorted = sectors.sort((a,b) => b.net_money - a.net_money);

    const ranking = sorted.map((s,i) => ({ 
      rank: i+1, 
      symbol: s.symbol,
      name: s.name, 
      net_money: s.net_money,
      change_pct: s.change_pct 
    }));

    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        date: new Date().toISOString(), 
        market: '美股', 
        ranking,
        unit: '美元 (ETF 成交额估算)',
        note: '数据基于板块 ETF 成交额估算'
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
