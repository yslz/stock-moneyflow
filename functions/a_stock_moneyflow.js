const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    // 使用东方财富 API - 提供收盘后数据
    const response = await axios.get('http://push2.eastmoney.com/api/qt/clist/get', {
      params: {
        pn: 1,
        pz: 50,
        po: 1,
        np: 1,
        ut: 'bd1d9ddb04089700cf9c27f6f7426281',
        fltt: 2,
        invt: 2,
        fid: 'f62',
        fs: 'm:90 t:3',  // 行业板块
        fields: 'f12,f14,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f124'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'http://quote.eastmoney.com/'
      }
    });

    console.log('Response:', response.data);
    
    if (!response.data || !response.data.data || !response.data.data.diff) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          date: new Date().toISOString(), 
          market: 'A 股', 
          ranking: [],
          message: 'No data available (可能非交易时间)'
        }, null, 2)
      };
    }

    const data = response.data.data.diff;
    
    // 按净流入排序
    const sorted = data.sort((a, b) => (parseFloat(b.f62)||0) - (parseFloat(a.f62)||0));

    const ranking = sorted.map((item, i) => ({
      rank: i + 1,
      name: item.f14 || '',  // 板块名称
      net_money: parseFloat(item.f62) || 0,  // 净流入（万）
      inflow: parseFloat(item.f66) || 0,  // 主力净流入（万）
      outflow: 0,  // 东方财富不直接提供流出数据
      change_pct: parseFloat(item.f124) || 0  // 涨跌幅
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        date: new Date().toISOString(), 
        market: 'A 股', 
        ranking 
      }, null, 2),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    };
  } catch (error) {
    console.error('Error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
