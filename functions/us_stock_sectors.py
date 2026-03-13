#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
美股板块表现 - Netlify Function
定时执行：每个交易日 04:30 (UTC+8)
"""

import json
import yfinance as yf
from datetime import datetime
from typing import List, Dict


# 标普 500 的 11 个板块 ETF
SECTOR_ETFS = {
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
    'XLE': 'Energy',
}


def get_sector_performance() -> List[Dict]:
    """获取美股板块表现数据"""
    sectors = []
    
    for symbol, name in SECTOR_ETFS.items():
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period='1d')
            
            if len(hist) > 0:
                close = float(hist['Close'].iloc[-1])
                open_price = float(hist['Open'].iloc[-1])
                change = close - open_price
                change_pct = (change / open_price) * 100
                volume = int(hist['Volume'].iloc[-1])
                
                sectors.append({
                    'symbol': symbol,
                    'name': name,
                    'price': round(close, 2),
                    'change_pct': round(change_pct, 2),
                    'volume': volume,
                })
        except Exception as e:
            print(f"{symbol} 失败：{e}")
    
    return sectors


def handler(event, context):
    """Netlify Function 入口"""
    print(f"执行时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 获取数据
    sectors = get_sector_performance()
    
    if not sectors:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "获取数据失败"}, ensure_ascii=False)
        }
    
    # 按涨跌幅排序
    sectors_sorted = sorted(sectors, key=lambda x: x['change_pct'], reverse=True)
    
    # 生成排名数据
    ranking = []
    for i, s in enumerate(sectors_sorted, 1):
        ranking.append({
            'rank': i,
            'symbol': s['symbol'],
            'name': s['name'],
            'price': s['price'],
            'change_pct': s['change_pct']
        })
    
    # 生成输出
    output = {
        'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'market': '美股',
        'ranking': ranking
    }
    
    # 返回 JSON
    return {
        "statusCode": 200,
        "body": json.dumps(output, ensure_ascii=False, indent=2),
        "headers": {
            "Content-Type": "application/json; charset=utf-8"
        }
    }


if __name__ == "__main__":
    # 本地测试
    result = handler({}, {})
    print(result["body"])
