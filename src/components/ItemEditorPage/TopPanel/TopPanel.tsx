import React from 'react'
import { Popup, Button, ButtonProps, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { hasReviews } from 'modules/collection/utils'
import CollectionProvider from 'components/CollectionProvider'
import JumpIn from 'components/JumpIn'
import ReviewModal from './ReviewModal'
import { ReviewType } from './ReviewModal/ReviewModal.types'
import { Props, State } from './TopPanel.types'
import './TopPanel.css'
import { Curation } from 'modules/curation/types'

export default class TopPanel extends React.PureComponent<Props, State> {
  state: State = {
    currentVeredict: undefined,
    isApproveModalOpen: false,
    isRejectModalOpen: false,
    isApproveCurationModalOpen: false,
    isRejectCurationModalOpen: false,
    isDisableModalOpen: false
  }

  handleBack = () => {
    this.props.onNavigate(locations.curation())
  }

  setApproveModalVisibility = (isApproveModalOpen: boolean) => {
    this.setState({ isApproveModalOpen })
  }

  setRejectModalVisibility = (isRejectModalOpen: boolean) => {
    this.setState({ isRejectModalOpen })
  }

  setApproveCurationModalVisibility = (isApproveCurationModalOpen: boolean) => {
    this.setState({ isApproveCurationModalOpen })
  }

  setRejectCurationModalVisibility = (isRejectCurationModalOpen: boolean) => {
    this.setState({ isRejectCurationModalOpen })
  }

  setDisableModalVisibility = (isDisableModalOpen: boolean) => {
    this.setState({ isDisableModalOpen })
  }

  renderPage = (collection: Collection, items: Item[], curation: Curation | null) => {
    const { isApproveModalOpen, isRejectModalOpen, isApproveCurationModalOpen, isRejectCurationModalOpen, isDisableModalOpen } = this.state
    const { chainId } = this.props

    const inCatalyst = this.inCatalyst(items)

    return (
      <>
        <div className="actions">
          <div className="back" onClick={this.handleBack} />
        </div>
        <div className="title">
          {collection.name}
          <JumpIn size="small" collection={collection} chainId={chainId} />
        </div>
        <div className="actions">
          <Popup
            disabled={inCatalyst}
            content={t('item_editor.top_panel.waiting_for_upload')}
            position="bottom center"
            trigger={<span className="button-container">{this.renderButtons(collection, curation, inCatalyst)}</span>}
            inverted
          />
        </div>

        <ReviewModal
          type={ReviewType.APPROVE}
          open={isApproveModalOpen}
          collection={collection}
          curation={null}
          onClose={() => this.setApproveModalVisibility(false)}
        />
        <ReviewModal
          type={ReviewType.REJECT}
          open={isRejectModalOpen}
          collection={collection}
          curation={null}
          onClose={() => this.setRejectModalVisibility(false)}
        />
        <ReviewModal
          type={ReviewType.APPROVE_CURATION}
          open={isApproveCurationModalOpen}
          collection={collection}
          curation={curation}
          onClose={() => this.setApproveCurationModalVisibility(false)}
        />
        <ReviewModal
          type={ReviewType.REJECT_CURATION}
          open={isRejectCurationModalOpen}
          collection={collection}
          curation={curation}
          onClose={() => this.setRejectCurationModalVisibility(false)}
        />
        <ReviewModal
          type={ReviewType.DISABLE}
          open={isDisableModalOpen}
          collection={collection}
          curation={null}
          onClose={() => this.setDisableModalVisibility(false)}
        />
      </>
    )
  }

  inCatalyst = (items: Item[]) => {
    return items.every(item => item.inCatalyst)
  }

  renderButton = (reviewType: ReviewType, buttonProps: ButtonProps) => {
    const onClickMap = {
      [ReviewType.APPROVE]: this.setApproveModalVisibility,
      [ReviewType.REJECT]: this.setRejectModalVisibility,
      [ReviewType.APPROVE_CURATION]: this.setApproveCurationModalVisibility,
      [ReviewType.REJECT_CURATION]: this.setRejectCurationModalVisibility,
      [ReviewType.DISABLE]: this.setDisableModalVisibility
    }

    const textMap = {
      [ReviewType.APPROVE]: 'approve',
      [ReviewType.REJECT]: 'reject',
      [ReviewType.APPROVE_CURATION]: 'approve_curation',
      [ReviewType.REJECT_CURATION]: 'reject_curation',
      [ReviewType.DISABLE]: 'disable'
    }

    return (
      <Button
        primary={![ReviewType.REJECT, ReviewType.REJECT_CURATION].includes(reviewType)}
        onClick={() => onClickMap[reviewType](true)}
        {...buttonProps}
      >
        {t(`item_editor.top_panel.${textMap[reviewType]}.action`)}
      </Button>
    )
  }

  renderButtons = (collection: Collection, curation: Curation | null, inCatalyst: boolean) => {
    const buttonProps = { disabled: !inCatalyst }

    if (collection.isApproved) {
      switch (curation?.status) {
        case 'pending':
          return (
            <>
              {this.renderButton(ReviewType.APPROVE_CURATION, buttonProps)}
              {this.renderButton(ReviewType.REJECT_CURATION, buttonProps)}
            </>
          )
        case 'approved':
          return this.renderButton(ReviewType.DISABLE, buttonProps)
        case 'rejected':
          return (
            <>
              {this.renderButton(ReviewType.APPROVE_CURATION, buttonProps)}
              {this.renderButton(ReviewType.DISABLE, buttonProps)}
            </>
          )
      }
    }

    if (hasReviews(collection)) {
      if (collection.isApproved) {
        return this.renderButton(ReviewType.DISABLE, buttonProps)
      } else {
        return this.renderButton(ReviewType.APPROVE, buttonProps)
      }
    }

    return (
      <>
        {this.renderButton(ReviewType.APPROVE, buttonProps)}
        {this.renderButton(ReviewType.REJECT, buttonProps)}
      </>
    )
  }

  render() {
    const { isCommitteeMember, isReviewing, selectedCollectionId, isConnected } = this.props

    return isCommitteeMember && isReviewing && isConnected ? (
      <div className="TopPanel">
        <CollectionProvider id={selectedCollectionId}>
          {(collection, items, curation, isLoading) =>
            !collection || isLoading ? <Loader size="small" active /> : this.renderPage(collection, items, curation)
          }
        </CollectionProvider>
      </div>
    ) : null
  }
}
