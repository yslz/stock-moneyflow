# 股票资金流数据 - Netlify 部署

A 股和美股板块资金流/表现数据定时采集，部署在 Netlify。

---

## 📁 项目结构

```
netlify-deploy/
├── functions/
│   ├── a_stock_moneyflow.py   # A 股资金流函数
│   └── us_stock_sectors.py    # 美股板块函数
├── public/                     # 静态文件（可选）
├── netlify.toml               # Netlify 配置
├── package.json               # Node.js 依赖
└── requirements.txt           # Python 依赖
```

---

## 🚀 部署步骤

### 1️⃣ 推送代码到 GitHub

```bash
cd /home/yslz/.openclaw/workspace/netlify-deploy

# 初始化 Git（如果还没做）
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/arby0350/stock-moneyflow.git

# 推送
git branch -M main
git push -u origin main
```

### 2️⃣ 在 Netlify 创建站点

1. 访问 https://app.netlify.com/
2. 点击 **"Add new site"** → **"Import an existing project"**
3. 选择 **"GitHub"**
4. 授权 Netlify 访问 GitHub
5. 搜索并选择 **"stock-moneyflow"** 仓库
6. 保持默认设置：
   - **Base directory**: (留空)
   - **Build command**: (留空)
   - **Publish directory**: `public`
7. 点击 **"Deploy site"**

### 3️⃣ 配置定时任务（重要！）

定时任务需要在 Netlify 后台手动配置：

1. 等待首次部署完成
2. 点击 **"Functions"** 标签
3. 点击 **`a_stock_moneyflow`** 函数
4. 点击 **"Schedule"** 子标签
5. 点击 **"Add schedule"**
6. 设置 Cron 表达式：`30 7 * * 1-5`（北京时间 15:30）
7. 点击 **"Save"**

重复以上步骤配置美股函数：
- 函数：`us_stock_sectors`
- Cron：`30 20 * * 1-5`（北京时间 4:30）

---

## 📊 访问数据

### API 端点

部署后，函数会自动生成 API 端点：

```
https://<你的站点名称>.netlify.app/.netlify/functions/a_stock_moneyflow
https://<你的站点名称>.netlify.app/.netlify/functions/us_stock_sectors
```

### 手动触发

```bash
# A 股
curl https://<你的站点名称>.netlify.app/.netlify/functions/a_stock_moneyflow

# 美股
curl https://<你的站点名称>.netlify.app/.netlify/functions/us_stock_sectors
```

---

## 📋 输出格式

### A 股资金流

```json
{
  "date": "2026-03-13 15:30",
  "market": "A 股",
  "ranking": [
    {
      "rank": 1,
      "name": "电池",
      "net_money": 44.65,
      "inflow": 366.45,
      "outflow": 321.8,
      "change_pct": 0.29
    }
  ]
}
```

### 美股板块

```json
{
  "date": "2026-03-13 04:30",
  "market": "美股",
  "ranking": [
    {
      "rank": 1,
      "symbol": "XLU",
      "name": "Utilities",
      "price": 46.50,
      "change_pct": 1.09
    }
  ]
}
```

---

## ⏰ 定时任务时间

| 任务 | Cron 表达式 | UTC 时间 | 北京时间 |
|------|-----------|---------|---------|
| A 股资金流 | `30 7 * * 1-5` | 周一 - 五 07:30 | 周一 - 五 15:30 |
| 美股板块 | `30 20 * * 1-5` | 周一 - 五 20:30 | 周二 - 六 04:30 |

---

## 🔧 本地测试

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 进入项目目录
cd netlify-deploy

# 本地运行
netlify dev

# 测试函数
curl http://localhost:8888/.netlify/functions/a_stock_moneyflow
curl http://localhost:8888/.netlify/functions/us_stock_sectors
```

---

## ⚠️ 注意事项

1. **免费额度**：Netlify 免费套餐有函数执行时长限制
2. **超时设置**：Python 函数默认超时 10 秒，可在后台调整
3. **依赖大小**：akshare 和 yfinance 较大，可能影响冷启动
4. **执行日志**：在 Netlify 后台查看 Functions 日志
5. **定时任务**：需要在 Netlify 后台手动配置，不能在 netlify.toml 中配置

---

## 📚 相关资源

- [Netlify Functions 文档](https://docs.netlify.com/functions/overview/)
- [Scheduled Functions](https://docs.netlify.com/functions/scheduled/)
- [Python Functions](https://docs.netlify.com/functions/runtimes/python/)

---

**部署成功后，就可以自动获取股票数据了！** 🎉
