const fs = require('fs')
const path = require('path')

const editorPath = path.resolve(__dirname, process.argv[2] || require.resolve('decentraland-ecs/artifacts/editor'))
const targetPath = path.resolve(__dirname, '../public/editor.js')

console.log(`> Copying file ${editorPath} into ${targetPath}`)

fs.copyFileSync(editorPath, targetPath)
