export type Props<T> = {
  items?: T[]
  accept: string | string[]
  renderFiles?: (files: T[]) => JSX.Element
  renderAction: (open: () => void) => JSX.Element
  onAcceptedFiles: (files: File[]) => void
  onRejectedFiles: (files: File[]) => void
}
