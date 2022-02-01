const { generateTree } = require('@dcl/content-hash-tree')

self.onmessage = async (event) => {
  if (event && event.data) {
    console.log('[WORKER] Generating tree', event.data.length)

    new Promise(resolve => {
      console.time('generateTree')
      generateTree(event.data)
      console.timeEnd('generateTree')
      resolve()
    }).then(_result => 
      self.postMessage('DONE')
    )
  }
}

// function healthCheck() {
//   console.log('Still alive')
//   setTimeout(() => {
//     healthCheck()
//   }, 10000)
// }