import net from "net";
import fs from "fs";
import path from "path";

// 查询某个端口是否可用
function isPortAvaliable(port) {
  return new Promise((resolve) => {
    const server = net.createServer().listen(port);
    server.on("listening", () => {
      server.close();
      resolve(true);
    });
    server.on("error", () => resolve(false));
  });
}

// 获取可用端口
async function getAvaliablePort() {
  const range = [3000, 9000];
  let i = range[0];
  for (let i = range[0]; i < range[1]; i++) {
    const isOk = await isPortAvaliable(i);
    if (isOk) return i;
  }
  throw new Error("no avaliable port");
}

// 获取目录信息
function getCatalogues(rootPath) {
  rootPath = path.resolve(rootPath);
  const stack = [rootPath];
  let catalogues = [];

  while (stack.length) {
    const popPath = stack.pop();
    const dirent = fs.readdirSync(popPath, { withFileTypes: true });
    for (const i of dirent) {
      const isDirectory = i.isDirectory();
      if (isDirectory) {
        stack.push(path.join(popPath, i.name));
      }
      catalogues.push({
        name: i.name,
        isDirectory,
        path: path.join(popPath, i.name),
      });
    }
  }

  return catalogues;
}

/**
 * 确保路径中文件夹存在
 * @param {string} p 路径
 * @description
 * fs 很多方法如：open, write 等必须在路径中的文件夹存在才行
 */
function ensureDir(p) {
  p = path.resolve(p);
  if (fs.existsSync(p)) return;

  const arr = p.split("/");
  let dir = arr[0];
  for (let i = 0; i < arr.length; i++) {
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    dir = dir + "/" + arr[i];
  }
}

function removeDir(p) {
  p = path.resolve(p);

  if (!fs.existsSync(p)) return;
  const stat = fs.statSync(p);
  if (stat.isFile()) {
    fs.unlinkSync(p);
  }
  if (stat.isDirectory()) {
    const children = fs.readdirSync(p);
    if (children.length) {
      children.forEach((i) => removeDir(p + "/" + i));
    }
    fs.rmdirSync(p);
  }
}

function copy(src, dest, filter) {
  src = path.resolve(src);
  dest = path.resolve(dest);

  const stat = fs.statSync(src);
  const info = {
    ...stat,
    isDirectory: stat.isDirectory(),
    isFile: stat.isFile(),
    name: src.match(/[^\/]+$/)?.[0],
  };

  if (typeof filter === "function" && !filter(info)) return;

  if (info.isFile) {
    ensureDir(dest);
    fs.copyFileSync(src, dest);
  }
  if (info.isDirectory) {
    ensureDir(dest);
    const children = fs.readdirSync(src) ?? [];
    children.forEach((i) => copy(`${src}/${i}`, `${dest}/${i}`, filter));
  }
}

const pipeAsync =
  (...fns) =>
  (input) =>
    fns.reduce((prev, cur) => prev.then(cur), Promise.resolve(input));

export {
  getAvaliablePort,
  getCatalogues,
  pipeAsync,
  ensureDir,
  removeDir,
  copy,
};
