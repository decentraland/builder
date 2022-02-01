export const ctx: Worker = self as any

ctx.addEventListener('message', event => {
  if (event && event.data) {
    ctx.postMessage(`[WORKER] Got the following data ${JSON.stringify(event.data)}`)
  }
})
