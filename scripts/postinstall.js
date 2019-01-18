const fs = require('fs')
const path = require('path')

const editorPath = process.argv[2] || '../node_modules/decentraland-ecs/artifacts/editor.js'
const ecsPath = process.argv[3] || '../node_modules/decentraland-ecs/dist/src/index.js'

fs.copyFileSync(path.resolve(__dirname, editorPath), path.resolve(__dirname, '../public/editor.js'))
fs.copyFileSync(path.resolve(__dirname, ecsPath), path.resolve(__dirname, '../src/modules/editor/ecs.txt'))
