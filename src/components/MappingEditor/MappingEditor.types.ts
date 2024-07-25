import { Mapping } from '@dcl/schemas'
import { LinkedContract } from 'modules/thirdParty/types'

export type Props = {
  mapping: Mapping
  contracts: LinkedContract[]
  contract: LinkedContract
  error?: string
  disabled?: boolean
  onChange: (mapping: Mapping, contract: LinkedContract) => void
}
