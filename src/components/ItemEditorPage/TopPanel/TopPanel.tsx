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

  renderPage(collection: Collection, items: Item[], curation: Curation | null) {
    const { isApproveModalOpen, isRejectModalOpen } = this.state
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

  inCatalyst(items: Item[]) {
    return items.every(item => item.inCatalyst)
  }

  renderButtons(collection: Collection, curation: Curation | null, inCatalyst: boolean) {
    const buttonProps = { disabled: !inCatalyst }

    if (curation?.status === 'pending') {
      return (
        <>
          {this.renderRejectButton(buttonProps)}
          {this.renderApproveButton(buttonProps)}
        </>
      )
    }

    if (curation?.status === 'approved') {
      return this.renderRejectButton(buttonProps)
    }

    if (curation?.status === 'rejected') {
      return this.renderApproveButton(buttonProps)
    }

    if (hasReviews(collection) && collection.isApproved) {
      return this.renderRejectButton(buttonProps)
    }

    if (hasReviews(collection) && !collection.isApproved) {
      return this.renderApproveButton(buttonProps)
    }

    return (
      <>
        {this.renderRejectButton(buttonProps)}
        {this.renderApproveButton(buttonProps)}
      </>
    )
  }

  renderApproveButton(props: ButtonProps) {
    return (
      <Button primary onClick={() => this.handleChangeApproveModalVisibility(true)} {...props}>
        {t('item_editor.top_panel.approve.action')}
      </Button>
    )
  }

  renderRejectButton(props: ButtonProps) {
    return (
      <Button onClick={() => this.handleChangeRejectModalVisibility(true)} {...props}>
        {t('item_editor.top_panel.reject.action')}
      </Button>
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
