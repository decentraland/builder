import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Network } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Icon, Loader, Modal } from 'decentraland-ui'
import { locations } from 'routing/locations'
import { CurationStatus } from 'modules/curations/types'
import { Props, RejectionType } from './RejectionModal.types'

import './RejectionModal.css'

const i18nBase = 'item_editor.top_panel.rejection_modal'

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
  const i18nKey = useMemo(() => {
    switch (type) {
      case RejectionType.DISABLE_COLLECTION:
        return i18nBase + '.disable_collection'
      case RejectionType.REJECT_CURATION:
        return i18nBase + '.reject_curation'
      default:
        return ''
    }
  }, [type])

  const handleReview = () => {
    switch (type) {
      case RejectionType.DISABLE_COLLECTION:
        onReject(collection)
        break
      case RejectionType.REJECT_CURATION:
        onRejectCuration(curation!.collectionId)
        break
      default:
    }
  }

  const shouldShowVeredict =
    (type === RejectionType.DISABLE_COLLECTION && !collection.isApproved) ||
    (type === RejectionType.REJECT_COLLECTION && !collection.isApproved) ||
    (type === RejectionType.REJECT_CURATION && curation?.status === CurationStatus.REJECTED)

  return (
    <Modal size="tiny" className="RejectionModal" open={open}>
      {hasPendingTransaction ? (
        <PendingTransaction i18nKey={i18nKey} />
      ) : shouldShowVeredict ? (
        <Veredict link={collection.forumLink} onClose={onClose} />
      ) : (
        <Confirmation i18nKey={i18nKey} isLoading={isLoading} onClose={onClose} onConfirm={handleReview} />
      )}
    </Modal>
  )
}

const PendingTransaction = ({ i18nKey }: { i18nKey: string }) => (
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

const Veredict = ({ link, onClose }: { link?: string; onClose: () => void }) => (
  <>
    <Modal.Header>{t(i18nBase + '.veredict_explanation')}</Modal.Header>
    <Modal.Content>{t(i18nBase + '.go_to_forum')}</Modal.Content>
    <Modal.Actions>
      <a href={link} className="forum-link" target="_blank" rel="noopener noreferrer">
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

const Confirmation = ({
  i18nKey,
  isLoading,
  onConfirm,
  onClose
}: {
  i18nKey: string
  isLoading: boolean
  onConfirm: () => void
  onClose: () => void
}) => (
  <>
    <Modal.Header>{t(`${i18nKey}.title`)}</Modal.Header>
    <Modal.Content>{t(`${i18nKey}.subtitle`)}</Modal.Content>
    <Modal.Actions>
      <NetworkButton primary onClick={onConfirm} disabled={isLoading} loading={isLoading} network={Network.MATIC}>
        {t(`${i18nKey}.action`)}
      </NetworkButton>
      <Button onClick={onClose}>{t('global.cancel')}</Button>
    </Modal.Actions>
  </>
)

export default React.memo(RejectionModal)
