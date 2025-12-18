import buffer from 'buffer'

const Buffer = buffer.Buffer

;(globalThis as any).Buffer = Buffer
;(window as any).Buffer = Buffer
