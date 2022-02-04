import React from 'react'

export type Props = {
  isLoading?: boolean
  error?: string | null
  moreInformation?: React.ReactElement<any>
  acceptedExtensions: string[]
  onDropAccepted: (files: File[]) => any
  onDropRejected: (files: File[]) => any
}
