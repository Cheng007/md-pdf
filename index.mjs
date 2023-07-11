import fs from "fs";
import path from "path";

import express from "express";
import puppeteer from "puppeteer";
import hljs from "highlight.js";
import markdownIt from "markdown-it";

import {
  getAvaliablePort,
  getCatalogues,
  ensureDir,
  removeDir,
  copy,
} from "./util.mjs";

const __dirname = path.resolve()

async function printPDF(targetPath, pageUrl) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: "networkidle0" });
  await page.pdf({
    format: "A4",
    path: targetPath,
  });
  await browser.close();
}

async function toPdf(pdfName, targetDir) {
  pdfName = pdfName.replace(/\.pdf$/i, "") + ".pdf";

  const port = await getAvaliablePort();
  const app = express();
  const targetUrl = path.join(targetDir, pdfName);
  app.use(express.static(targetDir));
  const server = app.listen(port);

  await printPDF(targetUrl, `http://localhost:${port}/`);
  server.close();
}

function getMarkdownPathList(rootPath) {
  const dir = getCatalogues(rootPath).map((i) => i.name);

  const filesPathList = [
    "README.md",
    "../preface.md",
    "foreword.md",
    ...dir.filter((i) => /^ch\d.md$/.test(i)),
    ...dir.filter((i) => /^ap[A-Z]\.md$/.test(i)),
  ]
    .map((i) => path.resolve(rootPath, i))
    .filter((i) => fs.existsSync(i));

  return filesPathList;
}

async function transfer(config) {
  const indexHtmlName = "index.html";
  const distDir = path.resolve(__dirname, config.targetDir);
  const dist = path.resolve(distDir, indexHtmlName);
  const templateDir = path.resolve(__dirname, config.templateDir);
  const template = path.resolve(templateDir, indexHtmlName);

  const mdit = markdownIt({
    html: true, // 支持html标签，如<img>
    xhtmlOut: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang, ignoreIllegals: true })
            .value;
        } catch (__) {}
      }
      return "";
    },
  });

  const rootPath = config.markdownDir;
  const html = getMarkdownPathList(rootPath)
    .map((i) => fs.readFileSync(i, { encoding: "utf-8" }))
    .map((i) => mdit.render(i))
    .join("");

  const htmlWithoutHref = html.replace(/<a\s+href="[^"]+">/g, "<a>");
  const indexHtml = fs
    .readFileSync(path.resolve(__dirname, template), {
      encoding: "utf-8",
    })
    .replace("js-content-placeholder", htmlWithoutHref);

  removeDir(distDir);
  ensureDir(dist);
  fs.writeFileSync(dist, indexHtml);
  copy(rootPath, distDir, (i) => !i.name.endsWith(".md"));
  copy(templateDir, distDir, (i) => i.name !== indexHtmlName);

  await toPdf(config.targetPdfName, config.targetDir);
}

async function transferAll() {
  const mdRootDir = "You-Dont-Know-JS-1ed-zh-CN";
  const books = [
    {
      name: "入门与进阶",
      mdDir: "up & going",
    },
    {
      name: "作用域与闭包",
      mdDir: "scope & closures",
    },
    {
      name: "this 与对象原型",
      mdDir: "this & object prototypes",
    },
    {
      name: "类型与文法",
      mdDir: "types & grammar",
    },
    {
      name: "异步与性能",
      mdDir: "async & performance",
    },
    {
      name: "ES6与未来",
      mdDir: "es6 & beyond",
    },
  ];
  const configs = books.map((i, idx) => ({
    templateDir: "template",
    markdownDir: `${mdRootDir}/${i.mdDir}`,
    markdownPathList: [],
    targetDir: `dist/你不懂JS-${idx + 1}-${i.name}`,
    targetPdfName: `你不懂JS-${idx + 1}-${i.name}.pdf`,
  }));
  configs.forEach(async (i) => {
    await transfer(i);
  });
}

// beforeHtml, afterHtml, beforePdf, afterPdf

transferAll();
