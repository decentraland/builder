import { AcceptedFileProps } from '../CreateSingleItemModal.types'

export type Props = {
  contents?: Record<string, Blob>
  title: string
  isLoading: boolean
  onDropAccepted: (acceptedFileProps: AcceptedFileProps) => void
  onDropRejected?: (files: File[]) => Promise<void>
  onClose: () => void
  onSaveVideo: () => void
}

export type StateData = {
  id: string
  error: string
  isLoading: boolean
  video: string
}

export type State = Partial<StateData>
