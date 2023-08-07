import { AcceptedFileProps } from '../CreateSingleItemModal.types'

export type Props = {
  contents?: Record<string, Blob>
  title: string
  required: boolean
  onDropAccepted: (acceptedFileProps: AcceptedFileProps) => void
  onDropRejected?: (files: File[]) => Promise<void>
  onBack?: () => void
  onClose: () => void
  onSaveVideo: () => void
}

export type StateData = {
  id: string
  error?: { title?: string; message: string }
  isLoading: boolean
  video: string
}

export type State = Partial<StateData>
