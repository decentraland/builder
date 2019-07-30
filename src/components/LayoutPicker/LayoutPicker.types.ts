export type Props = {
  rows: number
  cols: number
  onChange: (rows: number, cols: number) => void
  errorMessage?: string
  showGrid?: boolean
}
