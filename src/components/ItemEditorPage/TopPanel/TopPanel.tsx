import React from 'react'
import { Button, Loader, Modal } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { Collection } from 'modules/collection/types'
import { hasReviews } from 'modules/collection/utils'
import CollectionProvider from 'components/CollectionProvider'
import { Props } from './TopPanel.types'
import './TopPanel.css'

type State = {
  currentVeredict?: boolean
  isReviewModalOpen: boolean
}

export default class TopPanel extends React.PureComponent<Props, State> {
  state = {
    currentVeredict: undefined,
    isReviewModalOpen: false
  }

  handleBack = () => {
    this.props.onNavigate(locations.curation())
  }

  handleReject = () => {
    this.props.onReject()
  }

  handleApprove = () => {
    this.props.onApprove()
  }

  handleReviewModalVisibility = (isReviewModalOpen: boolean) => {
    this.setState({ isReviewModalOpen })
  }

  renderRejectButton() {
    return <Button onClick={() => this.handleReviewModalVisibility(true)}>{t('item_editor.top_panel.reject')}</Button>
  }

  renderApproveButton() {
    return (
      <Button primary onClick={() => this.handleReviewModalVisibility(true)}>
        {t('item_editor.top_panel.approve')}
      </Button>
    )
  }

  renderPage(collection: Collection) {
    const { isReviewModalOpen } = this.state
    return (
      <>
        <div className="actions">
          <div className="back" onClick={this.handleBack} />
        </div>
        <div className="title">{collection.name}</div>
        <div className="actions">
          {hasReviews(collection) ? (
            collection.isApproved ? (
              this.renderApproveButton()
            ) : (
              this.renderRejectButton()
            )
          ) : (
            <>
              {this.renderRejectButton()}
              {this.renderApproveButton()}
            </>
          )}
        </div>

        <Modal size="tiny" open={isReviewModalOpen}>
          <Modal.Header>Approve Collection</Modal.Header>
          <Modal.Content>
            If you feel this collection its up to Decentraland ultra magic and hyper amazing standards, go ahead, click the button.
          </Modal.Content>
          <Modal.Actions>
            <Button primary onClick={() => handleReview}>
              APPROVE
            </Button>
            <Button onClick={() => this.handleReviewModalVisibility(false)}>{t('global.cancel')}</Button>
          </Modal.Actions>
        </Modal>
      </>
    )
  }

  render() {
    const { isReviewing, selectedCollectionId } = this.props

    return isReviewing ? (
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
