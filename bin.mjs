#! /usr/bin/env node

// #! 符号名称叫 Shebang，用于指定脚本的解释程序
// Node CLI 应用入口文件必须要有这样的文件头

import inquirer from 'inquirer'

inquirer.prompt({
  type: 'input', // type： input, number, confirm, list, checkbox ... 
  name: 'name', // key 名
  message: 'Your name', // 提示信息
  default: 'default name' // 默认值
}).then(answer => console.log(answer))

console.log(11122212)
