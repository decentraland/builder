export type Props = {
  label: string
  disabled?: boolean
  maxLength?: number
  value?: string | null
  onChange: (newValue: string) => void
}
