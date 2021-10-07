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

  renderPage = (collection: Collection, curation: Curation | null) => {
    const { isApproveModalOpen, isRejectModalOpen, isApproveCurationModalOpen, isRejectCurationModalOpen } = this.state
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
      </>
    )
  }

  renderButton = (reviewType: ReviewType) => {
    const onClickMap = {
      [ReviewType.APPROVE]: this.setApproveModalVisibility,
      [ReviewType.REJECT]: this.setRejectModalVisibility,
      [ReviewType.APPROVE_CURATION]: this.setApproveCurationModalVisibility,
      [ReviewType.REJECT_CURATION]: this.setRejectCurationModalVisibility
    }

    const textMap = {
      [ReviewType.APPROVE]: 'approve',
      [ReviewType.REJECT]: 'reject',
      [ReviewType.APPROVE_CURATION]: 'approve_curation',
      [ReviewType.REJECT_CURATION]: 'reject_curation'
    }

    return (
      <Button
        primary={![ReviewType.REJECT, ReviewType.REJECT_CURATION].includes(reviewType)}
        onClick={() => onClickMap[reviewType](true)}
      >
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
              {this.renderButton(ReviewType.APPROVE_CURATION)}
              {this.renderButton(ReviewType.REJECT_CURATION)}
            </>
          )
        case 'approved':
        case 'rejected':
          return this.renderButton(ReviewType.REJECT)
      }
    }

    if (hasReviews(collection)) {
      if (collection.isApproved) {
        return this.renderButton(ReviewType.REJECT)
      } else {
        return this.renderButton(ReviewType.APPROVE)
      }
    }

    return (
      <>
        {this.renderButton(ReviewType.APPROVE)}
        {this.renderButton(ReviewType.REJECT)}
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
