# FROM node:16.14.0  as build-stage

#进入工作目录
# WORKDIR /app

#拷贝源码
# COPY . .

#编译
# RUN npm i pnpm -g
# RUN pnpm i
# RUN pnpm build

#开始封装nginx
FROM  nginx:stable-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY  ./dist .
# COPY --from=build-stage  /app/nginx.conf  /etc/nginx/nginx.conf

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
