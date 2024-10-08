import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { format } from 'date-fns'
import { Icon, Table } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { getCollectionCurationState } from 'modules/curations/collectionCuration/utils'
import { isThirdPartyCollection } from 'modules/collection/utils'
import { CurationStatus } from 'modules/curations/types'
import CollectionStatus from 'components/CollectionStatus'
import CollectionImage from 'components/CollectionImage'
import { CollectionTypeBadge } from 'components/Badges/CollectionTypeBadge'
import { ThirdPartyKindBadge } from 'components/Badges/ThirdPartyKindBadge'
import { AssignModalOperationType } from 'components/Modals/EditCurationAssigneeModal/EditCurationAssigneeModal.types'
import Profile from 'components/Profile'
import { formatDistanceToNow } from 'lib/date'
import { Props } from './CollectionRow.types'
import './CollectionRow.css'

export default function CollectionRow(props: Props) {
  const { collection, curation, address, itemCount, onOpenModal } = props
  const history = useHistory()

  const handleNavigateToForum = useCallback(
    (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
      window.open(collection.forumLink, '_blank')
      event.preventDefault()
      event.stopPropagation()
    },
    [collection]
  )

  const handleAssign = useCallback(
    (event: React.MouseEvent<HTMLSpanElement, MouseEvent>, type = AssignModalOperationType.SELF_ASSIGN) => {
      onOpenModal('EditCurationAssigneeModal', { collectionId: collection.id, type })
      event.preventDefault()
      event.stopPropagation()
    },
    [onOpenModal, collection]
  )

  const handleTableRowClick = useCallback(() => {
    history.push(locations.itemEditor({ collectionId: collection.id, isReviewing: 'true' }))
  }, [history, collection])

  const renderCurationState = useCallback(() => {
    const curationState = getCollectionCurationState(collection, curation)
    switch (curationState) {
      case CurationStatus.APPROVED:
        return (
          <div className="approved action">
            <span className="action-text">{t('collection_row.approved')}</span> <Icon name="check" />
          </div>
        )
      case CurationStatus.REJECTED:
        return (
          <div className="rejected action">
            <span className="action-text">{t('collection_row.rejected')}</span> <Icon name="close" />
          </div>
        )
      case CurationStatus.DISABLED:
        return (
          <div className="disabled action">
            <span className="action-text">{t('collection_row.disabled')}</span> <Icon name="close" />
          </div>
        )
      case CurationStatus.UNDER_REVIEW:
        return <span> {t('collection_row.under_review')}</span>

      case CurationStatus.TO_REVIEW:
        return <span> {t('collection_row.to_review')}</span>

      default:
        return <span> {t('collection_row.to_review')}</span>
    }
  }, [collection, curation])

  const createdAtDate = new Date(curation?.createdAt || collection.createdAt)

  return (
    <Table.Row className="CollectionRow" key={collection.id} onClick={handleTableRowClick}>
      <Table.Cell width={5}>
        <div className="image-column">
          <CollectionImage collectionId={collection.id} />
          <div className="info">
            <div className="title">
              <CollectionStatus collection={collection} />
              {collection.name}
            </div>
            <div className="subtitle name">{t('collection_row.items', { count: itemCount })}</div>
          </div>
        </div>
      </Table.Cell>
      <Table.Cell width={2}>
        <CollectionTypeBadge isThirdParty={isThirdPartyCollection(collection)} />
      </Table.Cell>
      <Table.Cell width={2}>
        <ThirdPartyKindBadge isProgrammatic={collection.isProgrammatic} />
      </Table.Cell>
      <Table.Cell width={2}>
        <div>{isThirdPartyCollection(collection) ? '-' : <Profile textOnly address={collection.owner} />}</div>
      </Table.Cell>
      <Table.Cell width={3}>
        <div title={format(createdAtDate, 'd MMMM yyyy HH:mm')}>
          <span>{t(curation ? 'collection_row.review_request' : 'collection_row.published')}</span>{' '}
          {formatDistanceToNow(createdAtDate, { addSuffix: true })}
        </div>
      </Table.Cell>
      <Table.Cell width={2}>
        <div className="actions text-centered">{renderCurationState()}</div>
      </Table.Cell>
      <Table.Cell width={2}>
        <div className="edit-container">
          {curation?.assignee ? (
            <>
              <div className="curator-name">
                <Profile textOnly address={curation.assignee} />
                {address === curation.assignee ? <> ({t('collection_row.you')})</> : null}{' '}
              </div>
              {curation.status !== CurationStatus.APPROVED || !collection.isApproved ? (
                <Icon
                  name="pencil"
                  onClick={(e: React.MouseEvent<HTMLSpanElement>) => handleAssign(e, AssignModalOperationType.REASSIGN)}
                />
              ) : null}
            </>
          ) : (
            <div className="assignee-container">
              {t('collection_row.unassigned')}
              <span className="link" onClick={handleAssign}>
                {t('collection_row.assign_to_me')}
              </span>
            </div>
          )}
        </div>
      </Table.Cell>
      <Table.Cell width={2}>
        <div className="text-centered">
          {collection.forumLink ? (
            <span className="link" onClick={handleNavigateToForum}>
              {t('collection_row.link')}
            </span>
          ) : (
            t('collection_row.no_forum_post')
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  )
}
