export type Props = {
  itemId: string
  label: string
  disabled?: boolean
  maxLength?: number
  value?: string | null
  onChange: (newValue: string) => void
}
