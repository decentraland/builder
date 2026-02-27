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
    const { history } = this.props
    history.push(locations.curation())
  }

  handleConfirmApprovalModal = (collection: Collection, curation: CollectionCuration | null) => {
    const { address, onInitiateApprovalFlow, onInitiateTPApprovalFlow, onSetAssignee } = this.props
    this.setState({ showApproveConfirmModal: false })
    address && onSetAssignee(collection.id, address, curation)
    isTPCollection(collection) ? onInitiateTPApprovalFlow(collection) : onInitiateApprovalFlow(collection)
  }

  setShowRejectionModal = (showRejectionModal: RejectionType | null) => this.setState({ showRejectionModal })

  renderPage = (collection: Collection) => {
    const { items, itemCurations, curation, totalItems, thirdParty } = this.props
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
          <JumpIn
            size="small"
            active
            collection={collection}
            chainId={chainId}
            items={isTPCollection(collection) ? items : undefined}
            text={t('global.see_in_decentraland')}
          />
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
            thirdParty={thirdParty}
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
    const { address, thirdParty, onInitiateApprovalFlow, onInitiateTPApprovalFlow, onDeployMissingEntities, reviewedItems, totalItems } =
      this.props

    const onClickMap = {
      [ButtonType.APPROVE]: () =>
        curation?.assignee && address !== curation?.assignee
          ? this.setState({ showApproveConfirmModal: true })
          : isTPCollection(collection)
          ? onInitiateTPApprovalFlow(collection)
          : onInitiateApprovalFlow(collection),
      [ButtonType.ENABLE]: () => onInitiateApprovalFlow(collection),
      [ButtonType.DISABLE]: () =>
        this.setShowRejectionModal(thirdParty ? RejectionType.DISABLE_THIRD_PARTY : RejectionType.DISABLE_COLLECTION),
      [ButtonType.REJECT]: () => {
        if (curation?.status === CurationStatus.PENDING) {
          this.setShowRejectionModal(RejectionType.REJECT_CURATION)
        } else {
          this.setShowRejectionModal(RejectionType.REJECT_COLLECTION)
        }
      },
      [ButtonType.DEPLOY_MISSING_ENTITIES]: () => onDeployMissingEntities(collection)
    }

    const i18nKeyByButtonType = {
      [ButtonType.APPROVE]: 'approve',
      [ButtonType.ENABLE]: 'enable',
      [ButtonType.DISABLE]: 'disable',
      [ButtonType.REJECT]: 'reject',
      [ButtonType.DEPLOY_MISSING_ENTITIES]: 'deploy_missing_entities'
    }

    const isPrimary = type === ButtonType.APPROVE || type === ButtonType.ENABLE || type === ButtonType.DEPLOY_MISSING_ENTITIES
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
    const { reviewedItems, totalItems, thirdParty } = this.props
    const areCurationsPending = itemCurations?.some(itemCuration => itemCuration.status === CurationStatus.PENDING)
    return (
      <>
        <Header sub>
          {areCurationsPending
            ? t('item_editor.top_panel.reviewed_counter', { count: reviewedItems.length, threshold: getTPThresholdToReview(totalItems!) })
            : t('item_editor.top_panel.not_enough_items_to_curate_more')}
          {reviewedItems.length >= getTPThresholdToReview(totalItems!) ? <Icon name="check circle" /> : null}
        </Header>
        {areCurationsPending && this.renderButton(ButtonType.APPROVE, collection, collectionCuration)}
        {areCurationsPending && this.renderButton(ButtonType.REJECT, collection, collectionCuration)}
        {!areCurationsPending && thirdParty?.isApproved && this.renderButton(ButtonType.DISABLE, collection, null)}
        {/* TODO: Add when enabling is possible {!areCurationsPending && !thirdParty?.isApproved && thirdParty?.root && this.renderButton(ButtonType.ENABLE, collection, null)} */}
      </>
    )
  }

  renderButtons = (collection: Collection, curation: CollectionCuration | null) => {
    // Case 1: Collection has an approved curation with pending status
    if (curation && collection.isApproved && curation.status === 'pending') {
      return (
        <>
          {this.renderButton(ButtonType.APPROVE, collection, curation)}
          {this.renderButton(ButtonType.REJECT, collection, curation)}
        </>
      )
    }

    // Case 2: Collection has an approved curation with approved/rejected status
    if (curation && collection.isApproved && (curation.status === 'approved' || curation.status === 'rejected')) {
      return (
        <>
          {this.renderButton(ButtonType.DISABLE, collection, curation)}
          {this.props.hasCollectionMissingEntities && this.renderButton(ButtonType.DEPLOY_MISSING_ENTITIES, collection, curation)}
        </>
      )
    }

    // Case 3: Collection has reviews and is approved
    if (hasReviews(collection) && collection.isApproved) {
      return (
        <>
          {this.renderButton(ButtonType.DISABLE, collection, curation)}
          {this.props.hasCollectionMissingEntities && this.renderButton(ButtonType.DEPLOY_MISSING_ENTITIES, collection, curation)}
        </>
      )
    }

    // Case 4: Collection has reviews but is not approved
    if (hasReviews(collection)) {
      return this.renderButton(ButtonType.ENABLE, collection, curation)
    }

    // Default case: Collection has no reviews and no active curation
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
