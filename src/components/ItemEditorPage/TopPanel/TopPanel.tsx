import React from 'react'
import { Button, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { Collection, CollectionType } from 'modules/collection/types'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { CurationStatus } from 'modules/curations/types'
import { Item } from 'modules/item/types'
import { getCollectionType, hasReviews, isTPCollection } from 'modules/collection/utils'
import CollectionProvider from 'components/CollectionProvider'
import JumpIn from 'components/JumpIn'
import RejectionModal from './RejectionModal'
import { RejectionType } from './RejectionModal/RejectionModal.types'
import { ButtonType, Props, State } from './TopPanel.types'
import './TopPanel.css'

export default class TopPanel extends React.PureComponent<Props, State> {
  state: State = {
    currentVeredict: undefined,
    showRejectionModal: null
  }

  handleBack = () => {
    this.props.onNavigate(locations.curation())
  }

  setShowRejectionModal = (showRejectionModal: RejectionType | null) => this.setState({ showRejectionModal })

  renderPage = (
    collection: Collection,
    collectionItems: Item[],
    curation: CollectionCuration | null,
    itemsCuration: ItemCuration[] | null
  ) => {
    const { showRejectionModal } = this.state
    const { chainId } = this.props
    const type = getCollectionType(collection)

    return (
      <>
        <div className="actions">
          <div className="back" onClick={this.handleBack} />
        </div>
        <div className="title">
          {collection.name}
          &nbsp;·&nbsp;
          {t(`collection.type.${type}`)}
          <JumpIn size="small" collection={collection} chainId={chainId} />
        </div>
        <div className="actions">
          <span className="button-container">
            {type === CollectionType.THIRD_PARTY
              ? this.renderTPButtons(collection, collectionItems, curation, itemsCuration)
              : this.renderButtons(collection, curation)}
          </span>
        </div>
        {showRejectionModal && (
          <RejectionModal
            type={showRejectionModal}
            open={true}
            collection={collection}
            curation={curation}
            onClose={() => this.setShowRejectionModal(null)}
          />
        )}
      </>
    )
  }

  renderButton = (type: ButtonType, collection: Collection, curation: CollectionCuration | null, collectionItems?: Item[]) => {
    const { onInitiateApprovalFlow, onInitiateTPApprovalFlow } = this.props

    const onClickMap = {
      [ButtonType.APPROVE]: () =>
        isTPCollection(collection) ? onInitiateTPApprovalFlow(collection, collectionItems!) : onInitiateApprovalFlow(collection),
      [ButtonType.ENABLE]: () => onInitiateApprovalFlow(collection),
      [ButtonType.DISABLE]: () => this.setShowRejectionModal(RejectionType.DISABLE_COLLECTION),
      [ButtonType.REJECT]: () => {
        if (curation?.status === CurationStatus.PENDING) {
          this.setShowRejectionModal(RejectionType.REJECT_CURATION)
        } else {
          this.setShowRejectionModal(RejectionType.REJECT_COLLECTION)
        }
      }
    }

    const i18nKeyByButtonType = {
      [ButtonType.APPROVE]: 'approve',
      [ButtonType.ENABLE]: 'enable',
      [ButtonType.DISABLE]: 'disable',
      [ButtonType.REJECT]: 'reject'
    }

    const isPrimary = type === ButtonType.APPROVE || type === ButtonType.ENABLE

    return (
      <Button primary={isPrimary} onClick={() => onClickMap[type]()}>
        {t(`item_editor.top_panel.${i18nKeyByButtonType[type]}`)}
      </Button>
    )
  }

  renderTPButtons = (
    collection: Collection,
    collectionItems: Item[],
    collectionCuration: CollectionCuration | null,
    itemCurations: ItemCuration[] | null
  ) => {
    const shouldShowApproveButton = itemCurations?.some(itemCuration => itemCuration.status === CurationStatus.PENDING)
    return (
      <>
        {shouldShowApproveButton ? this.renderButton(ButtonType.APPROVE, collection, collectionCuration, collectionItems) : null}
        {this.renderButton(ButtonType.REJECT, collection, collectionCuration)}
        {/* TODO: the disable button from below is not the same as the original disable one, it will be implemented once the sagas are ready */}
        {/* {this.renderButton(ButtonType.DISABLE, collection, collectionCuration)} */}
      </>
    )
  }

  renderButtons = (collection: Collection, curation: CollectionCuration | null) => {
    if (curation && collection.isApproved) {
      switch (curation.status) {
        case 'pending':
          return (
            <>
              {this.renderButton(ButtonType.APPROVE, collection, curation)}
              {this.renderButton(ButtonType.REJECT, collection, curation)}
            </>
          )
        case 'approved':
        case 'rejected':
          return this.renderButton(ButtonType.DISABLE, collection, curation)
      }
    }

    if (hasReviews(collection)) {
      if (collection.isApproved) {
        return this.renderButton(ButtonType.DISABLE, collection, curation)
      } else {
        return this.renderButton(ButtonType.ENABLE, collection, curation)
      }
    }

    return (
      <>
        {this.renderButton(ButtonType.APPROVE, collection, curation)}
        {this.renderButton(ButtonType.REJECT, collection, curation)}
      </>
    )
  }

  render() {
    const { isCommitteeMember, isReviewing, selectedCollectionId, isConnected } = this.props

    return isCommitteeMember && isReviewing && isConnected ? (
      <div className="TopPanel">
        <CollectionProvider id={selectedCollectionId}>
          {({ collection, items: collectionItems, itemCurations, curation, isLoading }) =>
            !collection || isLoading ? (
              <Loader size="small" active />
            ) : (
              this.renderPage(collection, collectionItems, curation, itemCurations)
            )
          }
        </CollectionProvider>
      </div>
    ) : null
  }
}
