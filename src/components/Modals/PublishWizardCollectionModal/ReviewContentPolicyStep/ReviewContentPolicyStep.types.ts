import { Collection } from 'modules/collection/types'

export type Props = {
  collection: Collection
  confirmedEmailAddress: string
  contentPolicyFirstConditionChecked: boolean
  acceptTermsOfUseChecked: boolean
  acknowledgeImmutability: boolean
  acknowledgeDaoTermsChecked: boolean
  subscribeToNewsletter: boolean
  onChangeEmailAddress: (value: string) => void
  onContentPolicyFirstConditionChange: (value: boolean) => void
  onAcceptTermsOfUseChange: (value: boolean) => void
  onAcknowledgeImmutability: (value: boolean) => void
  onAcknowledgeDaoTermsChange: (value: boolean) => void
  onSubscribeToNewsletter: (value: boolean) => void
  onNextStep: () => void
  onPrevStep: () => void
}
