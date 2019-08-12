export type SingleMigration<T> = (input: T) => T

export type Migration<T> = Record<string, SingleMigration<T>>

export type Versionable = { version: number }
