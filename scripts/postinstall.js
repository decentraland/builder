const fs = require('fs')
const path = require('path')

fs.copyFileSync(
  path.resolve(__dirname, '../node_modules/decentraland-ecs/artifacts/editor.js'),
  path.resolve(__dirname, '../public/editor.js')
)
