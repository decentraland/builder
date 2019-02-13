export type Props = {
  rows: number
  cols: number
  onChange: (layout: { cols: number; rows: number }) => void
  errorMessage?: string
  showGrid?: boolean
}
