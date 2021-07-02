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

  renderPage(collection: Collection, items: Item[]) {
    const { isApproveModalOpen, isRejectModalOpen } = this.state
    const { chainId } = this.props

    const inCatalyst = this.inCatalyst(items)
    const buttonProps = { disabled: !inCatalyst }

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
            trigger={
              <span className="button-container">
                {hasReviews(collection) ? (
                  collection.isApproved ? (
                    this.renderRejectButton(buttonProps)
                  ) : (
                    this.renderApproveButton(buttonProps)
                  )
                ) : (
                  <>
                    {this.renderRejectButton(buttonProps)}
                    {this.renderApproveButton(buttonProps)}
                  </>
                )}
              </span>
            }
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
          {(collection, items, isLoading) =>
            !collection || isLoading ? <Loader size="small" active /> : this.renderPage(collection, items)
          }
        </CollectionProvider>
      </div>
    ) : null
  }
}
