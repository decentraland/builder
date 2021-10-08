import React from 'react'
import { Button, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { Collection } from 'modules/collection/types'
import { Curation } from 'modules/curation/types'
import { hasReviews } from 'modules/collection/utils'
import CollectionProvider from 'components/CollectionProvider'
import JumpIn from 'components/JumpIn'
import ReviewModal from './ReviewModal'
import { ReviewType } from './ReviewModal/ReviewModal.types'
import { Props, State } from './TopPanel.types'

import './TopPanel.css'

export default class TopPanel extends React.PureComponent<Props, State> {
  state: State = {
    currentVeredict: undefined,
    isApproveModalOpen: false,
    isRejectModalOpen: false,
    isApproveCurationModalOpen: false,
    isRejectCurationModalOpen: false
  }

  handleBack = () => {
    this.props.onNavigate(locations.curation())
  }

  setRejectModalVisibility = (isRejectModalOpen: boolean) => {
    this.setState({ isRejectModalOpen })
  }

  setRejectCurationModalVisibility = (isRejectCurationModalOpen: boolean) => {
    this.setState({ isRejectCurationModalOpen })
  }

  renderPage = (collection: Collection, curation: Curation | null) => {
    const { isRejectModalOpen, isRejectCurationModalOpen } = this.state
    const { chainId } = this.props

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
          <span className="button-container">{this.renderButtons(collection, curation)}</span>
        </div>
        <ReviewModal
          type={ReviewType.REJECT}
          open={isRejectModalOpen}
          collection={collection}
          curation={null}
          onClose={() => this.setRejectModalVisibility(false)}
        />
        <ReviewModal
          type={ReviewType.REJECT_CURATION}
          open={isRejectCurationModalOpen}
          collection={collection}
          curation={curation}
          onClose={() => this.setRejectCurationModalVisibility(false)}
        />
      </>
    )
  }

  renderButton = (reviewType: ReviewType, collection: Collection) => {
    const { onInitiateApprovalFlow } = this.props

    const onClickMap = {
      [ReviewType.APPROVE]: () => onInitiateApprovalFlow(collection),
      [ReviewType.REJECT]: this.setRejectModalVisibility,
      [ReviewType.APPROVE_CURATION]: () => onInitiateApprovalFlow(collection),
      [ReviewType.REJECT_CURATION]: this.setRejectCurationModalVisibility
    }

    const textMap = {
      [ReviewType.APPROVE]: 'approve',
      [ReviewType.REJECT]: 'reject',
      [ReviewType.APPROVE_CURATION]: 'approve_curation',
      [ReviewType.REJECT_CURATION]: 'reject_curation'
    }

    return (
      <Button primary={![ReviewType.REJECT, ReviewType.REJECT_CURATION].includes(reviewType)} onClick={() => onClickMap[reviewType](true)}>
        {t(`item_editor.top_panel.${textMap[reviewType]}.action`)}
      </Button>
    )
  }

  renderButtons = (collection: Collection, curation: Curation | null) => {
    if (collection.isApproved) {
      switch (curation?.status) {
        case 'pending':
          return (
            <>
              {this.renderButton(ReviewType.APPROVE_CURATION, collection)}
              {this.renderButton(ReviewType.REJECT_CURATION, collection)}
            </>
          )
        case 'approved':
        case 'rejected':
          return this.renderButton(ReviewType.REJECT, collection)
      }
    }

    if (hasReviews(collection)) {
      if (collection.isApproved) {
        return this.renderButton(ReviewType.REJECT, collection)
      } else {
        return this.renderButton(ReviewType.APPROVE, collection)
      }
    }

    return (
      <>
        {this.renderButton(ReviewType.APPROVE, collection)}
        {this.renderButton(ReviewType.REJECT, collection)}
      </>
    )
  }

  render() {
    const { isCommitteeMember, isReviewing, selectedCollectionId, isConnected } = this.props

    return isCommitteeMember && isReviewing && isConnected ? (
      <div className="TopPanel">
        <CollectionProvider id={selectedCollectionId}>
          {(collection, _items, curation, isLoading) =>
            !collection || isLoading ? <Loader size="small" active /> : this.renderPage(collection, curation)
          }
        </CollectionProvider>
      </div>
    ) : null
  }
}
