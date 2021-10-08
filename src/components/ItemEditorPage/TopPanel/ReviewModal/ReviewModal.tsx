import React from 'react'
import { Link } from 'react-router-dom'
import { Network } from '@dcl/schemas'
import { ChainButton } from 'decentraland-dapps/dist/containers'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Icon, Loader, Modal } from 'decentraland-ui'
import { locations } from 'routing/locations'
import { Props, ReviewType } from './ReviewModal.types'

import './ReviewModal.css'

export default class ReviewModal extends React.PureComponent<Props> {
  handleReview = () => {
    const { type, collection, curation, onReject, onRejectCuration } = this.props
    switch (type) {
      case ReviewType.REJECT:
        onReject(collection)
        break
      case ReviewType.REJECT_CURATION:
        onRejectCuration(curation!.collectionId)
        break
      default:
        throw new Error(`Invalid review type: ${type}`)
    }
  }

  handleClose = () => {
    this.props.onClose()
  }

  getI18nKey() {
    const { type } = this.props
    const base = 'item_editor.top_panel'

    switch (type) {
      case ReviewType.REJECT:
        return base + '.reject'
      case ReviewType.REJECT_CURATION:
        return base + '.reject_curation'
      default:
        throw new Error(`Invalid review type: ${type}`)
    }
  }

  renderReview() {
    const { isLoading } = this.props
    const i18nKey = this.getI18nKey()
    return (
      <>
        <Modal.Header>{t(`${i18nKey}.title`)}</Modal.Header>
        <Modal.Content>{t(`${i18nKey}.subtitle`)}</Modal.Content>
        <Modal.Actions>
          <ChainButton primary onClick={this.handleReview} loading={isLoading} chainId={getChainIdByNetwork(Network.MATIC)}>
            {t(`${i18nKey}.action`)}
          </ChainButton>
          <Button onClick={this.handleClose}>{t('global.cancel')}</Button>
        </Modal.Actions>
      </>
    )
  }

  renderApproved() {
    return (
      <>
        <Modal.Header>{t('item_editor.top_panel.veredict_received')}</Modal.Header>
        <Modal.Content>{t('item_editor.top_panel.veredict_received_successfully')}</Modal.Content>
        <Modal.Actions>
          <Button primary onClick={this.handleClose}>
            {t('item_editor.top_panel.keep_reviewing')}
          </Button>
          <Link to={locations.curation()}>
            <Button basic>{t('item_editor.top_panel.back_to_curation')}</Button>
          </Link>
        </Modal.Actions>
      </>
    )
  }

  renderRejected() {
    const { collection } = this.props
    return (
      <>
        <Modal.Header>{t('item_editor.top_panel.veredict_explanation')}</Modal.Header>
        <Modal.Content>{t('item_editor.top_panel.go_to_forum')}</Modal.Content>
        <Modal.Actions>
          <a href={collection.forumLink} className="forum-link" target="_blank" rel="noopener noreferrer">
            <Button secondary icon labelPosition="right">
              <div>{t('item_editor.top_panel.forum_link')}</div>
              <div className="discussion">{t('item_editor.top_panel.discussion')}</div>
              <Icon name="chevron right" />
            </Button>
          </a>
          <Button basic onClick={this.handleClose}>
            {t('global.done')}
          </Button>
        </Modal.Actions>
      </>
    )
  }

  render() {
    const { open, type, collection, curation, hasPendingTransaction } = this.props
    const i18nKey = this.getI18nKey()

    return (
      <Modal size="tiny" className="ReviewModal" open={open}>
        {hasPendingTransaction ? (
          <>
            <Modal.Header>{t(`${i18nKey}.title`)}</Modal.Header>
            <div className="loading-transaction">
              <div className="danger-text">{t(`${i18nKey}.tx_pending`)}</div>
              <small className="danger-text">
                <T
                  id="item_editor.top_panel.visit_activity"
                  values={{
                    activity_link: <Link to={locations.activity()}>{t('global.activity')}</Link>
                  }}
                />
              </small>
              <Loader active size="large" />
            </div>
          </>
        ) : type === ReviewType.REJECT && !collection.isApproved ? (
          this.renderRejected()
        ) : type === ReviewType.REJECT_CURATION && curation?.status === 'rejected' ? (
          this.renderRejected()
        ) : (
          this.renderReview()
        )}
      </Modal>
    )
  }
}
