import { AcceptedFileProps } from '../CreateSingleItemModal.types'

export type Props = {
  contents?: Record<string, Blob>
  title: string
  isLoading: boolean
  onDropAccepted: (acceptedFileProps: AcceptedFileProps) => void
  onDropRejected?: (files: File[]) => Promise<void>
  onClose: () => void
}

export type StateData = {
  id: string
  error: string
  isLoading: boolean
}

export type State = Partial<StateData>
