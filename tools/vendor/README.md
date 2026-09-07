# Vendored 上游工具源码

为可复现构建与完整保留署名,将两个上游工具源码**供应商化**进本仓库(排除了 `node_modules`、`.git`、构建产物 `build/md-dist/dist`、测试运行物)。

| 目录 | 上游 | 说明 | 许可证 |
|---|---|---|---|
| `srk/` | SRK-Toolbox(CyberChef 中文 fork,Raka-loah/SRK-Toolbox → gchq/CyberChef) | webpack+Grunt 构建;产物 65MB | Apache-2.0(见 `srk/LICENSE`) |
| `it-tools/` | it-tools 中文版 fork(angelofan/it-tools → CorentinTh/it-tools) | Vue3+Vite;产物 13MB | MIT(见 `it-tools/LICENSE`) |

- **不得删除**各目录内的 `LICENSE`(及上游 `NOTICE`/署名)。
- 不直接修改 vendored 源码;需要改动时在别处打补丁或在 `docs/` 记录 diff。
- 重新构建见根 `scripts/build-tools.mjs`(P3 就绪后)。
