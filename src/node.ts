import buffer from 'buffer'
import process from 'process'

const Buffer = buffer.Buffer

;(globalThis as any).Buffer = Buffer
;(globalThis as any).process = process
;(window as any).Buffer = Buffer
;(window as any).process = process
