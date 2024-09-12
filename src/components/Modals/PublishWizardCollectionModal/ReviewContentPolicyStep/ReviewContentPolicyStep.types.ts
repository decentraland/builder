import { Collection } from 'modules/collection/types'

export type Props = {
  collection: Collection
  confirmedEmailAddress: string
  subscribeToNewsletter: boolean
  onChangeEmailAddress: (value: string) => void
  onSubscribeToNewsletter: (value: boolean) => void
  onNextStep: () => void
  onPrevStep: () => void
}
