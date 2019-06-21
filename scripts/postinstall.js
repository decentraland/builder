const fs = require('fs')
const path = require('path')

const editorPath = path.resolve(__dirname, process.argv[2] || require.resolve('decentraland-ecs/artifacts/unityBuilder'))
const targetPath = path.resolve(__dirname, '../public/editor.js')

console.log(`> Copying file ${editorPath} into ${targetPath}`)

fs.copyFileSync(editorPath, targetPath)

//const unityLoaderPath = path.resolve(__dirname, require.resolve('decentraland-ecs/artifacts/unity/Build/DCLUnityBuilder'))
//const targetUnityLoaderPath = path.resolve(__dirname, '../public/UnityBuilder.js')
//console.log(`> Copying file ${unityLoaderPath} into ${targetUnityLoaderPath}`)
//fs.copyFileSync(unityLoaderPath, targetUnityLoaderPath)
