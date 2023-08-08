import React from 'react'
import { ErrorMessage } from './ErrorMessage/ErrorMessage.types'

export type Props = {
  isLoading?: boolean
  error?: ErrorMessage | React.ReactNode | null
  moreInformation?: React.ReactElement<any>
  acceptedExtensions: string[]
  onDropAccepted: (files: File[]) => any
  onDropRejected: (files: File[]) => any
}

export type StateData = {
  itemLoaded: boolean
}

export type State = Partial<StateData>
