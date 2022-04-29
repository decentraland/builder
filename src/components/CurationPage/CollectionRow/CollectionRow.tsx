import React from 'react'
import { format } from 'date-fns'
import { Icon, Table } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { getCollectionCurationState } from 'modules/curations/collectionCuration/utils'
import { getCollectionType } from 'modules/collection/utils'
import { CurationStatus } from 'modules/curations/types'
import { CollectionType } from 'modules/collection/types'
import CollectionStatus from 'components/CollectionStatus'
import CollectionImage from 'components/CollectionImage'
import { AssignModalOperationType } from 'components/Modals/EditCurationAssigneeModal/EditCurationAssigneeModal.types'
import Profile from 'components/Profile'
import { formatDistanceToNow } from 'lib/date'
import { Props } from './CollectionRow.types'

import './CollectionRow.css'

export default class CollectionRow extends React.PureComponent<Props> {
  handleNavigateToForum = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    const { collection } = this.props
    window.open(collection.forumLink!, '_blank')
    event.preventDefault()
    event.stopPropagation()
  }

  handleAssign = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>, type = AssignModalOperationType.SELF_ASSIGN) => {
    const { onOpenModal, collection } = this.props
    onOpenModal('EditCurationAssigneeModal', { collectionId: collection.id, type })
    event.preventDefault()
    event.stopPropagation()
  }

  handleTableRowClick = () => {
    const { onNavigate, collection } = this.props
    onNavigate(locations.itemEditor({ collectionId: collection.id, isReviewing: 'true' }))
  }

  renderCurationState = () => {
    const { collection, curation } = this.props
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
  }

  render() {
    const { address, collection, itemCount, curation } = this.props
    const createdAtDate = new Date(curation?.createdAt || collection.createdAt)

    return (
      <Table.Row className="CollectionRow" key={collection.id} onClick={this.handleTableRowClick}>
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
          <div>
            {getCollectionType(collection) === CollectionType.THIRD_PARTY
              ? t('collection_row.type_third_party')
              : t('collection_row.type_standard')}
          </div>
        </Table.Cell>
        <Table.Cell width={2}>
          <div>{getCollectionType(collection) === CollectionType.THIRD_PARTY ? '-' : <Profile textOnly address={collection.owner} />}</div>
        </Table.Cell>
        <Table.Cell width={3}>
          <div title={format(createdAtDate, 'd MMMM yyyy HH:mm')}>
            <span>{t(curation ? 'collection_row.review_request' : 'collection_row.published')}</span>{' '}
            {formatDistanceToNow(createdAtDate, { addSuffix: true })}
          </div>
        </Table.Cell>
        <Table.Cell width={2}>
          <div className="actions text-centered">{this.renderCurationState()}</div>
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
                    onClick={(e: React.MouseEvent<HTMLSpanElement>) => this.handleAssign(e, AssignModalOperationType.REASSIGN)}
                  />
                ) : null}
              </>
            ) : (
              <div className="assignee-container">
                {t('collection_row.unassigned')}
                <span className="link" onClick={this.handleAssign}>
                  {t('collection_row.assign_to_me')}
                </span>
              </div>
            )}
          </div>
        </Table.Cell>
        <Table.Cell width={2}>
          <div className="text-centered">
            {collection.forumLink ? (
              <span className="link" onClick={this.handleNavigateToForum}>
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
}
