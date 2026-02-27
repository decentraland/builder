declare module '*.module.css'

type ActionFunction<T extends (...args: any) => any> = (...args: Parameters<T>) => unknown
