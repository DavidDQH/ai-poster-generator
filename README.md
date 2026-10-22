# AI Poster Generator — 上线就绪

一句话型海报生成器：输入创意描述 → AI 画海报背景 + Canvas 排版引擎自动排标题/副标题/CTA → 下载 PNG。
**纯前端、零 API Key、零服务器成本**，托管在任意静态平台即可运行。

## AI 是怎么实现的（重要，读一下）

- **背景图**：调用 Pollinations 免费文生图接口（`image.pollinations.ai`，无需注册、无需 Key，浏览器端直接请求）。
- **文字**：AI 生图模型对文字的拼写不可控，所以本站由前端排版引擎负责标题/副标题/CTA，保证文字 100% 清晰正确——这也是站内 FAQ 主打的差异点。
- **降级机制**：免费接口有排队和限速，超时/失败时自动改用种子随机的智能渐变背景，**工具永远出图，不会白屏**。

## 文件结构

```
ai-poster-generator/
├── index.html      # 页面 + 工具 + SEO 内容（FAQ/JSON-LD/canonical）
├── css/style.css   # 暗色 AI 工具风样式
├── js/app.js       # 生成引擎：6 种风格 × 4 种尺寸 × 排版引擎 + 降级
├── robots.txt / sitemap.xml
└── README.md
```

## 本地预览

```bash
cd ai-poster-generator
python -m http.server 8080     # 浏览器打开 http://localhost:8080
```

（直接双击 index.html 也能跑，但 AI 接口请求需要网络。）

## 上线（三选一）

| 路径 | 步骤 | 适用 |
|---|---|---|
| Netlify Drop | 文件夹拖到 app.netlify.com/drop | 5 分钟最快上线 |
| Cloudflare Pages | 推 GitHub → Pages 连仓库，构建命令留空，输出目录 `/` | 长期推荐，免费 CDN |
| 自己的服务器 | 打包 dist.zip 走 deploy.sh，映射对外端口 | 已有服务器时 |

## 上线后必做

- [ ] 全局替换 `YOURDOMAIN.com`（index.html 的 canonical / og:url / JSON-LD、robots.txt、sitemap.xml）
- [ ] 买域名绑定（Cloudflare/Namesilo ≈ $10/年）
- [ ] GSC 验证 + 提交 sitemap
- [ ] 加 GA4 或 Cloudflare Web Analytics
- [ ] 首页 4 个「Try these ideas」按钮 + FAQ 就是长尾词落地内容，外链先做 3-5 条

## 运营扩展路线（有流量后再做）

1. **程序化长尾页**：复制 index.html 改造 `/event-poster-generator`、`/sale-poster-generator`、`/birthday-poster-maker` 等用例页（改 title/正文/默认风格 preset），sitemap 逐个加入——这是哥飞词找站的经典打法。
2. **接自有生图 API**：免费接口并发有限，流量上来后换 Replicate / Flux 走一个 serverless 函数（Vercel/CF Workers），`js/app.js` 里只需替换 `loadAIImage` 一个函数。
3. **模板库页 / 多语言**：按数据决定。
4. **变现**：AdSense 或"高清无水印下载 $1"付费点（当前右下角水印很小，可自行调整/移除）。

## 合规提示

- 页面与 FAQ 已用克制措辞（"AI-imagery rules in your country/industry"），不要在页面冒充任何大厂模型官方产品。
- 商业化投放前建议补一份 Privacy Policy / Terms 页。
