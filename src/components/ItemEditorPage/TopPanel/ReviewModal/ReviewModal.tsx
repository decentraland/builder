import React, { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Network } from '@dcl/schemas'
import { ChainButton } from 'decentraland-dapps/dist/containers'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Icon, Loader, Modal } from 'decentraland-ui'
import { locations } from 'routing/locations'
import { CurationStatus } from 'modules/curation/types'
import { Props, ReviewType } from './ReviewModal.types'

import './ReviewModal.css'

const i18nBase = 'item_editor.top_panel.rejection_modal'

const i18nKeyByReviewType = {
  [ReviewType.REJECT_COLLECTION]: i18nBase + '.reject_collection',
  [ReviewType.REJECT_CURATION]: i18nBase + '.reject_curation',
  [ReviewType.DISABLE_COLLECTION]: i18nBase + '.disable_collection'
}

const RejectionModal = ({
  open,
  type,
  isLoading,
  hasPendingTransaction,
  collection,
  curation,
  onReject,
  onRejectCuration,
  onClose
}: Props) => {
  console.log(isLoading)

  const i18nKey = i18nKeyByReviewType[type]

  const handleReview = () => {
    const map = {
      [ReviewType.REJECT_COLLECTION]: () => onReject(collection),
      [ReviewType.REJECT_CURATION]: () => onRejectCuration(curation!.collectionId),
      [ReviewType.DISABLE_COLLECTION]: () => onReject(collection)
    }

    map[type]()
  }

  let content: ReactNode = null

  if (hasPendingTransaction) {
    content = (
      <>
        <Modal.Header>{t(`${i18nKey}.title`)}</Modal.Header>
        <div className="loading-transaction">
          <div className="danger-text">{t(`${i18nKey}.tx_pending`)}</div>
          <small className="danger-text">
            <T
              id={i18nBase + '.visit_activity'}
              values={{
                activity_link: <Link to={locations.activity()}>{t('global.activity')}</Link>
              }}
            />
          </small>
          <Loader active size="large" />
        </div>
      </>
    )
  } else if (
    (type === ReviewType.REJECT_COLLECTION && !collection.isApproved) ||
    (type === ReviewType.REJECT_CURATION && curation?.status === CurationStatus.REJECTED) ||
    (type === ReviewType.DISABLE_COLLECTION && !collection.isApproved)
  ) {
    content = (
      <>
        <Modal.Header>{t(i18nBase + '.veredict_explanation')}</Modal.Header>
        <Modal.Content>{t(i18nBase + '.go_to_forum')}</Modal.Content>
        <Modal.Actions>
          <a href={collection.forumLink} className="forum-link" target="_blank" rel="noopener noreferrer">
            <Button secondary icon labelPosition="right">
              <div>{t(i18nBase + '.forum_link')}</div>
              <div className="discussion">{t(i18nBase + '.discussion')}</div>
              <Icon name="chevron right" />
            </Button>
          </a>
          <Button basic onClick={onClose}>
            {t('global.done')}
          </Button>
        </Modal.Actions>
      </>
    )
  } else {
    content = (
      <>
        <Modal.Header>{t(`${i18nKey}.title`)}</Modal.Header>
        <Modal.Content>{t(`${i18nKey}.subtitle`)}</Modal.Content>
        <Modal.Actions>
          <ChainButton primary onClick={handleReview} disabled={isLoading} loading={isLoading} chainId={getChainIdByNetwork(Network.MATIC)}>
            {t(`${i18nKey}.action`)}
          </ChainButton>
          <Button onClick={onClose}>{t('global.cancel')}</Button>
        </Modal.Actions>
      </>
    )
  }

  return (
    <Modal size="tiny" className="ReviewModal" open={open}>
      {content}
    </Modal>
  )
}

export default React.memo(RejectionModal)
