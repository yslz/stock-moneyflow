#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
A 股板块资金流 - Netlify Function
定时执行：每个交易日 15:30 (UTC+8)
"""

import json
import akshare as ak
from datetime import datetime
from typing import List, Dict
import pandas as pd


def get_sector_flow() -> List[Dict]:
    """获取 A 股板块资金流数据"""
    try:
        df = ak.stock_fund_flow_industry(symbol="即时")
        
        sectors = []
        for _, row in df.iterrows():
            sectors.append({
                'rank': int(row['序号']) if pd.notna(row['序号']) else 0,
                'name': str(row['行业']),
                'index': float(row['行业指数']) if pd.notna(row['行业指数']) else 0,
                'change_pct': float(row['行业 - 涨跌幅']) if pd.notna(row['行业 - 涨跌幅']) else 0,
                'inflow': float(row['流入资金']) if pd.notna(row['流入资金']) else 0,
                'outflow': float(row['流出资金']) if pd.notna(row['流出资金']) else 0,
                'net_money': float(row['净额']) if pd.notna(row['净额']) else 0,
                'company_count': int(row['公司家数']) if pd.notna(row['公司家数']) else 0,
            })
        
        return sectors
    except Exception as e:
        print(f"获取数据失败：{e}")
        return []


def handler(event, context):
    """Netlify Function 入口"""
    print(f"执行时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 获取数据
    sectors = get_sector_flow()
    
    if not sectors:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "获取数据失败"}, ensure_ascii=False)
        }
    
    # 按净流入排序
    sectors_sorted = sorted(sectors, key=lambda x: x['net_money'], reverse=True)
    
    # 生成排名数据
    ranking = []
    for i, s in enumerate(sectors_sorted, 1):
        ranking.append({
            'rank': i,
            'name': s['name'],
            'net_money': round(s['net_money'], 2),
            'inflow': round(s['inflow'], 2),
            'outflow': round(s['outflow'], 2),
            'change_pct': round(s['change_pct'], 2)
        })
    
    # 生成输出
    output = {
        'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'market': 'A 股',
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
