export const defaultConfig = {
  // markdown 源
  markdownSource: {
    // markdown 路径，如果为数组，会将数组里的 markdown 合并成一个 pdf
    path: './'
  },
  // html 模版，控制 pdf 的样式
  htmlTemplate: {
    // 模版路径，如果为文件夹，会查找文件夹下的 index.html
    path: './template',
    // 占位符，Martkdownn 转换后的 html 会插入到这里并替换
    placeholder: 'js-content-placeholder',
  },
  // 生成的 pdf 配置
  pdfTarget: {
    // pdf 路径
    path: './dist',
    // pdf 名字
    name: 'target.pdf',
  }
}