const fs = require('fs')
const path = require('path')
const prettier = require('prettier')

// Prettifying ECS to avoid weird issue with Cloudflare

const editorPath = path.resolve(__dirname, process.argv[2] || require.resolve('decentraland-ecs/artifacts/editor'))
const targetEditorPath = path.resolve(__dirname, '../public/editor.js')

const ecsPath = path.resolve(__dirname, process.argv[3] || require.resolve('decentraland-ecs/dist/src/index.min.js'))
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

// Copy inspector assets to the public folder
const inspectorAssetsPath = path.resolve(__dirname, '../node_modules/@dcl/inspector/public')
console.log('Inspector assets:', inspectorAssetsPath)
const files = fs.readdirSync(inspectorAssetsPath)
const publicPath = path.resolve(__dirname, '../public')
console.log('Public folder:', publicPath)
for (const file of files) {
  const source = path.resolve(inspectorAssetsPath, file)
  const isDirectory = fs.statSync(source).isDirectory()
  const targetFile = isDirectory ? file : `inspector-${file}`
  const target = path.resolve(publicPath, targetFile)
  console.log(`> Copying ${file} as ${targetFile}...`)
  fs.cpSync(source, target, { recursive: true })
}
console.log(`> Add "inspector-" prefix to files in inspector-index.html`)
const htmlPath = path.resolve(publicPath, `inspector-index.html`)
const originalHtml = fs.readFileSync(htmlPath, 'utf-8')
const modifiedHtml = originalHtml.replace(/bundle\./g, 'inspector-bundle.')
fs.writeFileSync(htmlPath, modifiedHtml, 'utf-8')
