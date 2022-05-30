import React from 'react'
import { Button, Header, Icon, Loader, Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { Collection } from 'modules/collection/types'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { CurationStatus } from 'modules/curations/types'
import { getCollectionType, getTPThresholdToReview, hasReviews, isTPCollection } from 'modules/collection/utils'
import JumpIn from 'components/JumpIn'
import ConfirmApprovalModal from './ConfirmApprovalModal'
import RejectionModal from './RejectionModal'
import { RejectionType } from './RejectionModal/RejectionModal.types'
import { ButtonType, Props, State } from './TopPanel.types'
import './TopPanel.css'

export default class TopPanel extends React.PureComponent<Props, State> {
  state: State = {
    currentVeredict: undefined,
    showRejectionModal: null,
    showApproveConfirmModal: false
  }

  handleBack = () => {
    this.props.onNavigate(locations.curation())
  }

  handleConfirmApprovalModal = (collection: Collection, curation: CollectionCuration | null) => {
    const { address, onInitiateApprovalFlow, onInitiateTPApprovalFlow, onSetAssignee } = this.props
    this.setState({ showApproveConfirmModal: false })
    address && onSetAssignee(collection.id, address, curation)
    isTPCollection(collection) ? onInitiateTPApprovalFlow(collection) : onInitiateApprovalFlow(collection)
  }

  setShowRejectionModal = (showRejectionModal: RejectionType | null) => this.setState({ showRejectionModal })

  renderPage = (collection: Collection) => {
    const { items, itemCurations, curation, totalItems } = this.props
    const { showRejectionModal, showApproveConfirmModal } = this.state
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
          <JumpIn size="small" collection={collection} chainId={chainId} items={isTPCollection(collection) ? items : undefined} />
        </div>
        <div className="actions">
          <span className="button-container">
            {isTPCollection(collection) && totalItems !== undefined
              ? this.renderTPButtons(collection, curation, itemCurations)
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
        {curation?.assignee && showApproveConfirmModal && (
          <ConfirmApprovalModal
            open
            assignee={curation.assignee}
            onConfirm={() => this.handleConfirmApprovalModal(collection, curation)}
            onClose={() => this.setState({ showApproveConfirmModal: false })}
          />
        )}
      </>
    )
  }

  renderButton = (type: ButtonType, collection: Collection, curation: CollectionCuration | null) => {
    const { address, onInitiateApprovalFlow, onInitiateTPApprovalFlow, reviewedItems, totalItems } = this.props

    const onClickMap = {
      [ButtonType.APPROVE]: () =>
        curation?.assignee && address !== curation?.assignee
          ? this.setState({ showApproveConfirmModal: true })
          : isTPCollection(collection)
          ? onInitiateTPApprovalFlow(collection)
          : onInitiateApprovalFlow(collection),
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
    const isApproveButtonPopupDisabled =
      !isTPCollection(collection) || (!!totalItems && reviewedItems.length >= getTPThresholdToReview(totalItems))
    return (
      <Popup
        content={t('item_editor.top_panel.items_pending_to_review')}
        disabled={isApproveButtonPopupDisabled}
        position="bottom center"
        trigger={
          <div>
            <Button
              primary={isPrimary}
              onClick={() => onClickMap[type]()}
              disabled={
                isTPCollection(collection) &&
                type === ButtonType.APPROVE &&
                !!totalItems &&
                reviewedItems.length < getTPThresholdToReview(totalItems)
              }
            >
              {t(`item_editor.top_panel.${i18nKeyByButtonType[type]}`)}
            </Button>
          </div>
        }
        hideOnScroll={true}
        on="hover"
        inverted
        flowing
      />
    )
  }

  renderTPButtons = (collection: Collection, collectionCuration: CollectionCuration | null, itemCurations: ItemCuration[] | null) => {
    const { reviewedItems, totalItems } = this.props
    const shouldShowApproveButton = itemCurations?.some(itemCuration => itemCuration.status === CurationStatus.PENDING)
    return (
      <>
        <Header sub>
          {t('item_editor.top_panel.reviewed_counter', { count: reviewedItems.length, threshold: getTPThresholdToReview(totalItems!) })}
          {reviewedItems.length >= getTPThresholdToReview(totalItems!) ? <Icon name="check circle" /> : null}
        </Header>
        {shouldShowApproveButton ? this.renderButton(ButtonType.APPROVE, collection, collectionCuration) : null}
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
    const { collection, items, isCommitteeMember, isReviewing, isConnected, isLoading } = this.props
    // Show loader only while loading the first page of items
    const showLoader = !collection || (isLoading && !items.length)
    return isCommitteeMember && isReviewing && isConnected ? (
      <div className="TopPanel">{showLoader ? <Loader size="small" active /> : this.renderPage(collection)}</div>
    ) : null
  }
}
