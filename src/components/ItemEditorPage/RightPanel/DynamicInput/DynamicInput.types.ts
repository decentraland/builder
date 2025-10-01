export type Props = {
  value: string
  disabled?: boolean
  maxLength?: number
  placeholder?: string
  editable?: boolean
  onChange?: (newValue: string) => void
  className?: string
}
