# Markdown 转 PDF

## 背景

网上下载的最新版 PDF《你不知道的JS》在阅读过程中发现有些许错误，
网上电子版PDF已经不是最新修订后的版本了，
最新版在 `Github` 上以 Markdown 形式呈现，
遂有了直接将网上 Markdown 文件转成 PDF 以方便随时查阅的想法

## 使用

```bash
npm i
npm run init
```

## 实现方案

Markdown -> Html -> PDF

1. Markdown -> Html

使用 `markdonwit` 库

2. Html -> PDF

利用无头浏览器(puppeteer)将网页打印成 PDF

## TODO

抽象成通用工具
