export type Props = {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  className?: string
  onChange(value: number): void
}

export type State = {
  value: number
  id: string
}
