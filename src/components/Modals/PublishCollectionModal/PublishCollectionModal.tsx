import React from 'react'
import { Props } from './PublishCollectionModal.types'
import PublishCollectionModalOld from '../PublishCollectionModalOld'
import PublishCollectionModalWithOracle from '../PublishCollectionModalWithOracle'

const PublishCollectionModal = ({ isRaritiesWithOracleEnabled, ...rest }: Props) => {
  return isRaritiesWithOracleEnabled ? <PublishCollectionModalWithOracle {...rest} /> : <PublishCollectionModalOld {...rest} />
}

export default React.memo(PublishCollectionModal)
