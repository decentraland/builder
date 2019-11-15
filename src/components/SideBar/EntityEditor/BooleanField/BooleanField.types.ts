export type Props = {
  id: string
  label: string
  value: boolean
  className?: string
  onChange(value: boolean): void
}
