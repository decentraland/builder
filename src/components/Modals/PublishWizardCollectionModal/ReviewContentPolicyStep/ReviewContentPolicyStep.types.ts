import { Collection } from 'modules/collection/types'

export type Props = {
  collection: Collection
  confirmedEmailAddress: string
  contentPolicyFirstConditionChecked: boolean
  acceptTermsOfUseChecked: boolean
  ackowledgeDaoTermsChecked: boolean
  onChangeEmailAddress: (value: string) => void
  onContentPolicyFirstConditionChange: (value: boolean) => void
  onAcceptTermsOfUseChange: (value: boolean) => void
  onAckowledgeDaoTermsChange: (value: boolean) => void
  onNextStep: () => void
  onPrevStep: () => void
}
