const fs = require('fs')
const path = require('path')
const prettier = require('prettier')

const editorPath = path.resolve(__dirname, process.argv[2] || require.resolve('decentraland-ecs/artifacts/editor'))
const targetEditorPath = path.resolve(__dirname, '../public/editor.js')

const ecsPath = path.resolve(__dirname, process.argv[3] || require.resolve('decentraland-ecs/dist/src/index.js'))
const targetEcsPath = path.resolve(__dirname, '../src/ecsScene/ecs.js.raw')

console.log(`> Copying file ${editorPath} into ${targetEditorPath}`)
fs.copyFileSync(editorPath, targetEditorPath)

console.log(`> Reading file ${ecsPath}`)
const ecs = fs.readFileSync(ecsPath, 'utf8')
console.log(`Prettifying file...`)
const pretty = prettier.format(ecs, {
  parser: 'babel',
  semi: false,
  singleQuote: true,
  printWidth: 140
})
console.log(`Saving file to ${targetEcsPath}`)
fs.writeFileSync(targetEcsPath, pretty, { encoding: 'utf8' })
