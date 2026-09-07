# OnyxForge · 生产镜像(纯静态,运行期零后端依赖)
# 构建方式: scripts/docker-build.sh 会先 patch-srk + assemble-site,
#          然后以仓库根为 context 执行: docker build -f deploy/Dockerfile .
# 默认对外端口建议映射到宿主机 39899: docker run -d -p 39899:80 onyxforge
FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
# tools/dist/site = assemble-site.mjs 合成(壳 + /tools/srk + /tools/it)
COPY tools/dist/site /usr/share/nginx/html

EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
