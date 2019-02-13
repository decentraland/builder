export type Props = {
  rows: number
  cols: number
  onChange: (evt: { cols: number; rows: number }) => void
  errorMessage?: string
  showGrid?: boolean
}
