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
import { ButtonType, Props, State } from './TopPanel.types'

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

  renderButton = (type: ButtonType, collection: Collection) => {
    const { onInitiateApprovalFlow } = this.props

    const onClickMap = {
      [ButtonType.APPROVE]: () => onInitiateApprovalFlow(collection),
      [ButtonType.REJECT]: this.setRejectModalVisibility, // this.setRejectCurationModalVisibility
      [ButtonType.ENABLE]: () => onInitiateApprovalFlow(collection),
      [ButtonType.DISABLE]: this.setRejectModalVisibility
      // [ReviewType.APPROVE]: () => onInitiateApprovalFlow(collection),
      // [ReviewType.REJECT]: this.setRejectModalVisibility,
      // [ReviewType.APPROVE_CURATION]: () => onInitiateApprovalFlow(collection),
      // [ReviewType.REJECT_CURATION]: this.setRejectCurationModalVisibility
    }

    const textMap = {
      [ButtonType.APPROVE]: 'approve',
      [ButtonType.REJECT]: 'reject',
      [ButtonType.ENABLE]: 'enable',
      [ButtonType.DISABLE]: 'disable'
      // [ReviewType.APPROVE]: 'approve',
      // [ReviewType.REJECT]: 'reject',
      // [ReviewType.APPROVE_CURATION]: 'approve_curation',
      // [ReviewType.REJECT_CURATION]: 'reject_curation'
    }

    const isPrimary = type === ButtonType.APPROVE || type === ButtonType.ENABLE

    return (
      <Button primary={isPrimary} onClick={() => onClickMap[type](true)}>
        {t(`item_editor.top_panel.${textMap[type]}.action`)}
      </Button>
    )
  }

  renderButtons = (collection: Collection, curation: Curation | null) => {
    if (collection.isApproved) {
      switch (curation?.status) {
        case 'pending':
          return (
            <>
              {this.renderButton(ButtonType.APPROVE, collection)}
              {this.renderButton(ButtonType.REJECT, collection)}
            </>
          )
        case 'approved':
        case 'rejected':
          return this.renderButton(ButtonType.DISABLE, collection)
      }
    }

    if (hasReviews(collection)) {
      if (collection.isApproved) {
        return this.renderButton(ButtonType.REJECT, collection)
      } else {
        return this.renderButton(ButtonType.ENABLE, collection)
      }
    }

    return (
      <>
        {this.renderButton(ButtonType.APPROVE, collection)}
        {this.renderButton(ButtonType.REJECT, collection)}
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
