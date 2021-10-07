import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollections, getLoading as getLoadingCollection } from 'modules/collection/selectors'
import { getLoading as getLoadingItem } from 'modules/item/selectors'
import { getCurationsByCollectionId, getLoading as getLoadingCuration } from 'modules/curation/selectors'
import { isWalletCommitteeMember } from 'modules/committee/selectors'
import { FETCH_COLLECTIONS_REQUEST } from 'modules/collection/actions'
import { FETCH_ITEMS_REQUEST } from 'modules/item/actions'
import { FETCH_CURATION_REQUEST } from 'modules/curation/actions'
import { MapStateProps } from './CurationPage.types'
import CurationPage from './CurationPage'

const mapState = (state: RootState): MapStateProps => {
  const curationsByCollectionId = getCurationsByCollectionId(state)
  const collections = getCollections(state).filter(collection => collection.isPublished)

  return {
    wallet: getWallet(state)!,
    collections,
    curationsByCollectionId,
    isCommitteeMember: isWalletCommitteeMember(state),
    isConnecting: isConnecting(state),
    isLoading:
      isLoadingType(getLoadingCollection(state), FETCH_COLLECTIONS_REQUEST) ||
      isLoadingType(getLoadingItem(state), FETCH_ITEMS_REQUEST) ||
      isLoadingType(getLoadingCuration(state), FETCH_CURATION_REQUEST)
  }
}

const mapDispatch = () => ({})

export default connect(mapState, mapDispatch)(CurationPage)
