import React from 'react'
import { Button, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { Collection } from 'modules/collection/types'
import { hasReviews } from 'modules/collection/utils'
import CollectionProvider from 'components/CollectionProvider'
import JumpIn from 'components/JumpIn'
import ReviewModal from './ReviewModal'
import { ReviewType } from './ReviewModal/ReviewModal.types'
import { Props, State } from './TopPanel.types'
import './TopPanel.css'

export default class TopPanel extends React.PureComponent<Props, State> {
  state = {
    currentVeredict: undefined,
    isApproveModalOpen: false,
    isRejectModalOpen: false
  }

  handleBack = () => {
    this.props.onNavigate(locations.curation())
  }

  handleChangeApproveModalVisibility = (isApproveModalOpen: boolean) => {
    this.setState({ isApproveModalOpen })
  }

  handleChangeRejectModalVisibility = (isRejectModalOpen: boolean) => {
    this.setState({ isRejectModalOpen })
  }

  renderPage(collection: Collection) {
    const { isApproveModalOpen, isRejectModalOpen } = this.state
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
          {hasReviews(collection) ? (
            collection.isApproved ? (
              this.renderRejectButton()
            ) : (
              this.renderApproveButton()
            )
          ) : (
            <>
              {this.renderRejectButton()}
              {this.renderApproveButton()}
            </>
          )}
        </div>

        <ReviewModal
          type={ReviewType.APPROVE}
          open={isApproveModalOpen}
          collection={collection}
          onClose={() => this.handleChangeApproveModalVisibility(false)}
        />
        <ReviewModal
          type={ReviewType.REJECT}
          open={isRejectModalOpen}
          collection={collection}
          onClose={() => this.handleChangeRejectModalVisibility(false)}
        />
      </>
    )
  }

  renderApproveButton() {
    return (
      <Button primary onClick={() => this.handleChangeApproveModalVisibility(true)}>
        {t('item_editor.top_panel.approve.action')}
      </Button>
    )
  }

  renderRejectButton() {
    return <Button onClick={() => this.handleChangeRejectModalVisibility(true)}>{t('item_editor.top_panel.reject.action')}</Button>
  }

  render() {
    const { isCommitteeMember, isReviewing, selectedCollectionId } = this.props

    return isCommitteeMember && isReviewing ? (
      <div className="TopPanel">
        <CollectionProvider id={selectedCollectionId}>
          {(collection, _collectionItems, isLoading) =>
            !collection || isLoading ? <Loader size="small" active /> : this.renderPage(collection!)
          }
        </CollectionProvider>
      </div>
    ) : null
  }
}
