export type Props = {
  rows: number | undefined
  cols: number | undefined
  onChange: (rows: number | undefined, cols: number | undefined) => void
  errorMessage?: string
  showGrid?: boolean
}
