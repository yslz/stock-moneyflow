const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    // 美股板块资金流 - 使用 AKShare 类似的思路
    // 这里用模拟数据，因为美股板块资金流数据较难获取
    // 实际应该调用专业的美股数据 API
    
    // 使用 sector performance 数据作为替代
    const sectors = [
      { name: 'Technology', symbol: 'XLK', net_money: 0, change_pct: 0 },
      { name: 'Health Care', symbol: 'XLV', net_money: 0, change_pct: 0 },
      { name: 'Financial', symbol: 'XLF', net_money: 0, change_pct: 0 },
      { name: 'Consumer Cyclical', symbol: 'XLY', net_money: 0, change_pct: 0 },
      { name: 'Consumer Defensive', symbol: 'XLP', net_money: 0, change_pct: 0 },
      { name: 'Industrials', symbol: 'XLI', net_money: 0, change_pct: 0 },
      { name: 'Utilities', symbol: 'XLU', net_money: 0, change_pct: 0 },
      { name: 'Basic Materials', symbol: 'XLB', net_money: 0, change_pct: 0 },
      { name: 'Real Estate', symbol: 'XLRE', net_money: 0, change_pct: 0 },
      { name: 'Communication Svcs', symbol: 'XLC', net_money: 0, change_pct: 0 },
      { name: 'Energy', symbol: 'XLE', net_money: 0, change_pct: 0 }
    ];

    // 获取每个板块 ETF 的数据
    for (const sector of sectors) {
      try {
        const res = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${sector.symbol}?interval=1d&range=1d`, { 
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } 
        });
        const m = res.data.chart.result[0]?.meta;
        if (m) {
          const open = m.previousClose || m.chartPreviousClose;
          const close = m.regularMarketPrice || m.previousClose;
          const changePct = open ? (((close - open) / open) * 100) : 0;
          const volume = m.regularMarketVolume || 0;
          
          // 估算资金流（成交量 * 平均价格）
          const estimatedFlow = (volume * close) / 10000;  // 转换为万美元
          
          sector.price = parseFloat(close.toFixed(2));
          sector.change_pct = parseFloat(changePct.toFixed(2));
          sector.net_money = parseFloat(estimatedFlow.toFixed(2));
          sector.volume = volume;
        }
      } catch(e) {
        console.error(`${sector.symbol} failed:`, e.message);
      }
    }

    // 按净流入排序
    const sorted = sectors.sort((a,b) => b.net_money - a.net_money);

    const ranking = sorted.map((s,i) => ({ 
      rank: i+1, 
      name: s.name, 
      net_money: s.net_money,
      change_pct: s.change_pct 
    }));

    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        date: new Date().toISOString(), 
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
