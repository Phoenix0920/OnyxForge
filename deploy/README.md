# 部署说明

发布目录 = 由 `scripts/assemble-site.mjs` 合成的 `tools/dist/site`(壳 + `/tools/srk` + `/tools/it` 同源,~79MB 纯静态)。

## 方案 A:Docker(推荐)

```bash
bash scripts/docker-build.sh            # 先 assemble 再构建,产出镜像 onyxforge:latest
docker run -d --name onyxforge -p 39899:80 onyxforge:latest
# 浏览器打开 http://<服务器IP>:39899
```

镜像即 `nginx:alpine + site`(`deploy/Dockerfile`)。建议再挂反向代理/CDN 上 HTTPS;或
在镜像前套一层系统 nginx/certbot。

## 方案 B:裸机 nginx(与 Docker 内同一份配置)

```bash
node scripts/assemble-site.mjs                    # 产出 tools/dist/site
sudo cp deploy/nginx.conf /etc/nginx/conf.d/onyxforge.conf
# 编辑该文件:把 root 改为 tools/dist/site 的绝对路径
sudo nginx -t && sudo systemctl reload nginx
```

## 隐私红线

- 默认零外呼(审计见 PLAN §5)。仅 4 个「联网工具」会在用户显式操作时外呼,壳内已加提示条。
- 验证方式:`node scripts/scan-external.mjs`,确认无 `api.laftools` / `extstatic` / 分析脚本。

## 端口

容器内 80;对外建议映射 39899(与 MDGJX 历史一致,便于替换)。HTTPS 由外层反向代理终止。
