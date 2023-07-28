export type Props<T> = {
  items?: T[]
  accept: string | string[]
  className?: string
  disabled?: boolean
  renderFiles?: (files: T[]) => JSX.Element
  renderAction: (open: (event: React.MouseEvent) => void) => JSX.Element
  onAcceptedFiles: (files: File[]) => void
  onRejectedFiles: (files: File[]) => void
}
