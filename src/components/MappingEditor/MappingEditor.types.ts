import { Mapping } from '@dcl/schemas'

export type Props = {
  mapping: Mapping
  error?: string
  disabled?: boolean
  onChange: (mapping: Mapping) => void
}
