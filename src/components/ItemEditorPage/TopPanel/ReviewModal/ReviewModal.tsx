import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Loader, Modal } from 'decentraland-ui'
import { Props, ReviewType } from './ReviewModal.types'
import './ReviewModal.css'

export default class ReviewModal extends React.PureComponent<Props> {
  handleReview = () => {
    const { type, collection, onApprove, onReject } = this.props
    switch (type) {
      case ReviewType.APPROVE:
        onApprove(collection)
        break
      case ReviewType.REJECT:
        onReject(collection)
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
      case ReviewType.APPROVE:
        return base + '.approve'
      case ReviewType.REJECT:
        return base + '.reject'
      default:
        throw new Error(`Invalid review type: ${type}`)
    }
  }

  render() {
    const { open, isLoading, hasPendingTransaction } = this.props
    const i18nKey = this.getI18nKey()

    return (
      <Modal size="tiny" className="ReviewModal" open={open}>
        <Modal.Header>{t(`${i18nKey}.title`)}</Modal.Header>
        <Modal.Content>{t(`${i18nKey}.subtitle`)}</Modal.Content>

        {hasPendingTransaction ? (
          <div className="loading">
            <div className="danger-text">{t(`${i18nKey}.tx_pending`)}</div>
            <Loader active size="large" />
          </div>
        ) : (
          <Modal.Actions>
            <Button primary onClick={this.handleReview} loading={isLoading}>
              {t(`${i18nKey}.action`)}
            </Button>
            <Button onClick={this.handleClose}>{t('global.cancel')}</Button>
          </Modal.Actions>
        )}
      </Modal>
    )
  }
}
