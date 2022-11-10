export type Props<T> = {
  asset: T
  errors: Record<string, string>
  onChange(asset: T): void
}
