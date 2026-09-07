# OnyxForge · 玄铁炉

> 隐私优先、可自托管的开发/安全网页工具集。整合 **CyberChef 系 381 个操作**与 **it-tools 系 81 个子工具**(共 **462 个**),全部在**浏览器本地计算**,运行期零后端依赖、默认零外呼。

- 本仓库:https://github.com/Phoenix0920/OnyxForge
- 开发计划与可行性结论:见 [`PLAN.md`](./PLAN.md)
- 品牌配置(名称/版本/上游署名):见 [`brand.config.json`](./brand.config.json)
- 版本:**0.1.0**

---

## 特性

- **462 个工具,两个互补来源**:
  - `CyberChef 工具集`(CyberChef 中文版)—— 一个可多步串联的"数据操作流水线",擅长编码/加解密/哈希/压缩/数据与网络解析/安全逆向等。
  - `it-tools 中文版` —— 一组独立小工具,日常开发零碎活:UUID/密码、JSON、Base64、哈希、正则、颜色、二维码、Cron 等。
- **全浏览器本地计算**:工具不经你的服务器外发,敏感数据不出本机。
- **同源纯静态**:壳 + `/tools/srk` + `/tools/it` 在同一 origin 下 iframe 深链,运行期无 Node/Go/数据库。
- **隐私红线**:默认零外呼;仅 4 个「联网工具」(HTTP 请求 / DNS over HTTPS / 在地图上显示 / ASCII 艺术文本生成)在显式使用时才外呼,壳内有提示条。可用 `npm run dist:scan` 回归扫描。
- **易用壳**:分类磁贴总览 / 全量搜索(中英关键词)/ 收藏 / 最近使用 / 明暗主题(与工具内主题联动)。
- **一键自托管**:单 Docker 镜像(nginx + 纯静态)即可上线。

## 技术栈

- 壳:React 18 + Vite 5 + TypeScript(HashRouter,无重型依赖)
- 工具静态包:SRK / CyberChef(webpack)、it-tools(Vue3 + Vite),以供应商化源码构建
- 部署:nginx(见 `deploy/`)

## 本地开发

前置:Node 18+。仓库内 `apps/web` 与 `tools/vendor/*` 各自需要 `npm install`。

```bash
# 1) 壳:安装依赖并启动(默认 http://127.0.0.1:5174)
cd apps/web && npm install && npm run dev

# 2) 工具静态包(首次 / 上游改动后重新构建)
npm --prefix tools/vendor/it-tools run build   # 建议 Node 18;内存敏感加 NODE_OPTIONS=--max-old-space-size=6144
node scripts/patch-srk.mjs                      # 从 MDGJX-extensions 快照或仓库内自建产物合成 /tools/srk

# 3) 导航元数据(可选,重新抽取 462 工具)
node scripts/gen-nav.mjs ../MDGJX-extensions/meta/miaoda-dist-all.json
```

> 根 `package.json` 提供便捷脚本:`npm run web:dev / web:build / tools:it:build / dist:srk / dist:assemble / dist:scan / serve / docker`。

## 构建可发布单目录

```bash
npm run dist:srk       # 准备 /tools/srk(含路径与品牌改写)
npm run dist:assemble  # 合成 tools/dist/site(壳 + /tools/srk + /tools/it,同源)
npm run serve          # 本地端到端预览 http://127.0.0.1:8900
```

产物 `tools/dist/site`(~79MB 纯静态)即部署目录。

## 部署

### Docker(推荐)

```bash
bash scripts/docker-build.sh                # 合成发布目录并构建镜像 onyxforge
docker run -d --name onyxforge -p 39899:80 onyxforge
```

已发布就绪包:`release/onyxforge-0.1.0-server.tgz`(含 Dockerfile + nginx.conf + site/,在服务器上 `bash deploy.sh` 即可)。详见 [`deploy/README.md`](./deploy/README.md)。

### 裸机 nginx

把 `tools/dist/site` 指向 `deploy/nginx.conf` 的 `root` 即可;该配置已含 `/tools/it` 的 history 回退。

## 隐私与「联网工具」

- 默认加载零外呼;`npm run dist:scan` 可随时回归。
- 4 个联网工具会在显式使用时向第三方请求(figlet 字体 CDN、公共地图瓦片、DoH、用户指定的 URL),壳内会显示琥珀提示条。详见 `PLAN.md §5`。

## 许可证与上游署名

- 本仓整体 **AGPL-3.0**(壳为全新实现,避免沿用旧 AGPL 壳代码)。
- 供应商化上游(LICENSE 已保留在 `tools/vendor/*/`):
  - CyberChef(GCHQ,Apache-2.0)→ SRK-Toolbox 中文 fork
  - it-tools(CorentinTh,MIT)→ it-tools 中文版 fork
- 发布时请保留各上游 LICENSE 与本文件的署名信息。
