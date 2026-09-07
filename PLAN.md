# OnyxForge 玄铁炉 — 开发计划

> 状态:实施中(2026-09-07 启动)。品牌已定 **OnyxForge / 玄铁炉 · 自托管工具集**。

## 1. 项目是什么

从两个开源仓库重构出的、**全新命名的自托管网页工具集**:

- **上游素材**
  - `MDGJX`(秒达工具箱 / 前身 LafTools)—— 贡献"壳"的思路与工具注册机制,**不整仓继承**。
  - `MDGJX-extensions`(开发快照,含供应商化第三方工具)—— 贡献两个可独立构建的静态工具包:
    - `SRK-Toolbox` = CyberChef 中文 fork,约 381 个操作,静态产物约 65MB。
    - `it-tools` = it-tools 中文版 fork,81 个子工具,静态产物约 13MB。
  - 合计 **19 个来源分类、462 个工具**,全部浏览器本地计算。

- **已确认的决策**
  | 项 | 决策 |
  |---|---|
  | 重构路线 | A · 全新薄壳 + 全量 462 工具(V1 不做工具内部深度视觉统一) |
  | 工具范围 | 全量 462 |
  | 命名 | 英文品牌 OnyxForge + 中文副标「玄铁炉 · 自托管工具集」 |
  | 部署 | 纯静态同源单目录;运行时零后端依赖,单台 Ubuntu 即可 |
  | 后端 | 无 Go、无 Node 应用进程、无数据库、无账号(单用户本地优先) |

- **刻意不做(裁剪掉)**:Go 核心、登录/用户体系、工作区、终端 pty、浏览器端插件安装/市场、桌面端、Chrome 扩展、`/v3`/`/ws`/extstatic 全部云端耦合。

## 2. 目标架构

```
onyxforge/
├─ brand.config.json          # ★ 品牌唯一出口
├─ apps/web/                  # 新壳:Vite + React 18 + TS
├─ tools/vendor/srk/          # 供应商化 SRK 源码(保留上游 LICENSE/NOTICE)
├─ tools/vendor/it-tools/     # 供应商化 it-tools 源码(保留上游 LICENSE)
├─ tools/dist/{srk,it-tools}/ # 构建产物(运行期只依赖这里 + apps/web 产物)
├─ meta/tools.json            # 462 工具导航元数据(由脚本生成,入库固化)
├─ scripts/
│  ├─ build-tools.mjs         # 构建两个工具到子路径
│  ├─ gen-nav.mjs             # 注册表 → tools.json
│  └─ scan-external.mjs       # 产物外呼隐私审计
└─ deploy/                    # Dockerfile(nginx:alpine)/ nginx.conf / Caddyfile / systemd
```

关键设计:全部同源。`apps/web` 与工具静态包放在同一 origin,iframe 指向 `/tools/srk/…`、`/tools/it/…`。导航数据走本地 `meta/tools.json`,**不走任何接口**。

## 3. 阶段与验收

### P0 · 可行性 Spike(进行中)
- [x] 确认注册表 JSON 结构(19 分类 / 462 工具 / 深链字段格式)
- [ ] SRK:验证 `?recipe=` 深链机制、子路径承载、现有 build/prod 是否可直接用
- [ ] it-tools:验证 base 路径 + locale 路由、子工具深链 `/tools/it/<id>`
- [ ] 生成 `meta/tools.json` 草案
- [ ] 隐私外呼审计(两个工具源码/产物里的外链、统计、CDN)
- **产出**:本文件「§5 P0 结论」+ tools.json

### P1 · 品牌 + 仓库骨架 + 合规
- [ ] 建仓、目录、brand.config、PLAN.md
- [ ] 供应商化两个工具源码(排除 node_modules/dist,保留 LICENSE)
- [ ] 许可证与署名合规核对(见 §4)
- [ ] gen-nav / build-tools / scan-external 三脚本就位

### P2 · 新壳开发
- [ ] 设计 tokens + 亮/暗主题(全新视觉,不用 Mantine 皮肤)
- [ ] 首页总览卡片(19 分类分组) + 左侧分类树
- [ ] 全量搜索(中/英/拼音,走本地索引)
- [ ] 收藏夹 + 最近使用(localStorage,免登录)
- [ ] iframe 深链宿主 + `/tool/<id>` 路由
- 验收:`npm run dev` 一键起、零外呼、无任何账号/云端请求

### P3 · 构建与裁剪
- [ ] 两个工具统一子路径构建(约 80MB 静态)
- [ ] scan-external 复跑 → 「联网工具说明页」素材
- 验收:断网下绝大多数工具可用

### P4 · 部署包
- [ ] `deploy/Dockerfile`(nginx:alpine)+ Caddyfile/systemd + HTTPS
- [ ] 本地 Docker 全流程跑通 → 可上传发布包

### P5 · 上服务器 + 冒烟(需用户配合)
- [ ] 上传到 Ubuntu → 反代 HTTPS → 19 分类抽样冒烟 → 控制台确认零外呼

## 4. 许可证与合规(重点)

- **CyberChef 系**上游 Apache-2.0、**it-tools** 上游 MIT:供应商化时必须保留 LICENSE、并在 README/关于页给足归属与来源链接。
- 本仓/新壳若复用 `MDGJX`(AGPL-3.0)的任何代码,整仓须 AGPL。**新壳从零写、不抄旧壳逻辑**,但保留 AGPL-3.0 是最安全的默认(见 brand.config)。
- 隐私红线:默认不产生任何外部网络请求;个别"联网工具"(如 CyberChef 的 HTTP/DNS/WHOIS/URL 抓取、it-tools 少数项)由用户显式触发,需在「联网工具」说明页列明。

## 5. P0 结论

可行性判定:**可行**。两工具均纯静态、可子路径承载、可逐工具深链。最终路径方案:

| 工具 | 部署路径 | 深链格式 | 落地改动 | 重打包 |
|---|---|---|---|---|
| SRK / CyberChef 系 | `/tools/srk/` | `#recipe=<操作名>()`(query 亦可;`&input=<base64>` 预填;默认自动执行) | 现成 `build/prod` 拷入后,`index.html` 与 `assets/main.js` 内 `/ext-view/srk` → `/tools/srk`(免重编译,后处理脚本化) | `grunt prod`,Node18+~2GB 堆,数分钟 |
| it-tools | `/tools/it/` | `/tools/it/<id>`(子工具独立懒加载 chunk) | `src/router.ts:22` + `vite.config.ts:19` 两处 base → `/tools/it`,重新 build | `npm run build`,Node18,2–5 分钟 |

注意事项:
- it-tools 内置 PWA SW(会后台预缓存全量工具);manifest/webmanifest scope 随 base 重build 更新。方案:默认**保留** SW 但确认 scope 正确;若要最小传输可后续考虑关闭。
- SRK 无 Service Worker;localStorage 仅 options/favourites。
- it-tools Plausible 默认关闭、源码无 fetch/后端请求;SRK 纯静态、Worker/OCR 资源子路径自适应。
- 深链正确性以上游代码推导为准,P2/P3 联调时以浏览器实跑复核(冒烟清单 §P5)。

工具导航数据:`meta/tools.json` 已生成(2 插件组 / 19 分类 / 462 工具),深链字段已拆解为 `{type:'recipe'|'route'}`。

隐私外呼审计:**通过(默认零外呼)**。审计结论:

- **默认加载零外呼**:两个产物加载时不向任何第三方域名发请求(无统计脚本;it-tools 的 Plausible 默认关闭 noop;umami 不存在;SRK 的 `ga.html` 是未编入产物的死文件)。
- **功能触发型外呼(需整改/说明)**,共 3 处代码整改 + 1 页说明:
  1. `it-tools/ascii-text-drawer` → figlet 字体从 `//unpkg.com` 拉取(建议本地化字体)。
  2. `SRK/ShowOnMap`(在地图上显示)→ Leaflet 由 unpkg 注入、瓦片 `maps.wikimedia.org`(本地化 Leaflet;瓦片列入联网说明)。
  3. `SRK/src/web/static/ga.html`(GA 死文件,未进产物)→ 删除。
  4. 「联网工具说明页」清单:C1 SRK — HTTP请求 / DNS over HTTPS(用户输入目标);C2 SRK — 在地图上显示;it-tools — ASCII 文本绘图。CyberChef 其余 29 个「网络」操作均为本地解析/指纹,零联网;OCR 在本构建已本地化。
- 整改执行(2026-09-07):① `ga.html` 已从 vendored 源码删除;② figlet/Leaflet 决定走「壳内联网提示条 + scan-external 回归」而非本地化(改上游工具源码成本高、收益低,日后要纯离线再在 vendor 内改源码并重打包);③ 壳内 `NET_TOOLS` 已对 4 个联网工具加提示条;④ `scripts/scan-external.mjs` 已落地(默认零外呼,无 api.laftools/extstatic/分析脚本)。

