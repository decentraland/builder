const fs = require('fs')
const path = require('path')

const artifactPath = process.argv[2] || '../node_modules/decentraland-ecs/artifacts/editor.js'

fs.copyFileSync(path.resolve(__dirname, artifactPath), path.resolve(__dirname, '../public/editor.js'))
