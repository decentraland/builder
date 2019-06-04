const fs = require('fs')
const path = require('path')

const ecsVersion = require(require.resolve('decentraland-ecs/package.json')).version
const editorFile = `editor.${ecsVersion}.js`

console.log(`ECS version: ${ecsVersion}`)

const originalPath = path.resolve(__dirname, '../build/editor.js')
const versionedPath = path.resolve(__dirname, `../build/${editorFile}`)
const indexPath = path.resolve(__dirname, '../build/index.html')

console.log(`> Renaming editor.js into ${editorFile}`)

fs.renameSync(originalPath, versionedPath)

const html = fs.readFileSync(indexPath, 'utf8')
fs.writeFileSync(indexPath, html.replace('editor.js', editorFile), 'utf8')
