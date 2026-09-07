#!/usr/bin/env bash
# docker-build.sh —— 重新合成发布目录并构建 OnyxForge 生产镜像
# 用法: bash scripts/docker-build.sh [tag]   (默认 tag=onyxforge:latest)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

TAG="${1:-onyxforge:latest}"

echo "== 1/3 准备 SRK 静态包(路径替换) =="
node scripts/patch-srk.mjs

echo "== 2/3 合成发布目录 tools/dist/site =="
node scripts/assemble-site.mjs

echo "== 3/3 docker build =="
docker build -f deploy/Dockerfile -t "$TAG" .

cat <<EOF
完成。在本机运行验证:
  docker run -d --name onyxforge -p 39899:80 $TAG
  open http://127.0.0.1:39899

推送到服务器(服务器装好 Docker 后):
  docker save $TAG | ssh <user>@<host> 'docker load'
  # 或 docker tag/push 到你的 registry
EOF
