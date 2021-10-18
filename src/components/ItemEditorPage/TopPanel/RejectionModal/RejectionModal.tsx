import React, { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Network } from '@dcl/schemas'
import { ChainButton } from 'decentraland-dapps/dist/containers'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Icon, Loader, Modal } from 'decentraland-ui'
import { locations } from 'routing/locations'
import { CurationStatus } from 'modules/curation/types'
import { Props, RejectionType } from './RejectionModal.types'

import './RejectionModal.css'

const i18nBase = 'item_editor.top_panel.rejection_modal'

const i18nKeyByReviewType = {
  [RejectionType.REJECT_COLLECTION]: i18nBase + '.reject_collection',
  [RejectionType.REJECT_CURATION]: i18nBase + '.reject_curation',
  [RejectionType.DISABLE_COLLECTION]: i18nBase + '.disable_collection'
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
      [RejectionType.REJECT_COLLECTION]: () => onReject(collection),
      [RejectionType.REJECT_CURATION]: () => onRejectCuration(curation!.collectionId),
      [RejectionType.DISABLE_COLLECTION]: () => onReject(collection)
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
    (type === RejectionType.REJECT_COLLECTION && !collection.isApproved) ||
    (type === RejectionType.REJECT_CURATION && curation?.status === CurationStatus.REJECTED) ||
    (type === RejectionType.DISABLE_COLLECTION && !collection.isApproved)
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
    <Modal size="tiny" className="RejectionModal" open={open}>
      {content}
    </Modal>
  )
}

export default React.memo(RejectionModal)
