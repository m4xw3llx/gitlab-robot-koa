# gitlab-robot-koa

用 KOA 框架和 Typescript 实现的是一个 gitlab webhook 服务端。

## 目前功能

1. 接收 Push event。

2. 保存到本地。

3. 每天早上 9 点清空昨天数据，统计昨天数据，发送到飞书通知群。

## 运行

```bash
# 安装依赖
npm install
```

```bash
# 本地运行
npm run watch-server
```

```bash
# docker 打包
docker build ./ --tag gitlab-robot-koa
```
