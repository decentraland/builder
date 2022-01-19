export type Props = {
  title: string
  error: string | null
  acceptedExtensions: string[]
  onDropAccepted: (files: File[]) => any
  onDropRejected: (files: File[]) => any
  onClose: () => any
}
