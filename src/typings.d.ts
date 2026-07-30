declare module '*.module.css'

declare module '*.glb?url' {
  const src: string
  export default src
}

type ActionFunction<T extends (...args: any) => any> = (...args: Parameters<T>) => unknown
