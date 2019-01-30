const fs = require('fs')
const path = require('path')

const editorPath = process.argv[2] || '../node_modules/decentraland-ecs/artifacts/editor.js'

fs.copyFileSync(path.resolve(__dirname, editorPath), path.resolve(__dirname, '../public/editor.js'))
