const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    const response = await axios.get('http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeDataSimple', {
      params: { page: 1, num: 50, sort: 'netmoney', asc: 0, node: 'hybk' },
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const data = response.data || [];
    const sorted = data.sort((a, b) => (parseFloat(b.netmoney)||0) - (parseFloat(a.netmoney)||0));

    const ranking = sorted.map((item, i) => ({
      rank: i + 1,
      name: item.name || '',
      net_money: parseFloat(item.netmoney) || 0,
      inflow: parseFloat(item.inflow) || 0,
      outflow: parseFloat(item.outflow) || 0,
      change_pct: parseFloat(item.changepercent) || 0
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        date: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }), 
        market: 'A 股', 
        ranking 
      }, null, 2),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
