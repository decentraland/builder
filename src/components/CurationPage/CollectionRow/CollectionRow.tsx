import React from 'react'
import { format } from 'date-fns'
import { Grid, Icon as UIIcon } from 'decentraland-ui'
import { Link } from 'react-router-dom'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { hasReviews } from 'modules/collection/utils'
import Icon from 'components/Icon'
import CollectionImage from 'components/CollectionImage'
import Profile from 'components/Profile'
import { formatDistanceToNow } from 'lib/date'
import { Props } from './CollectionRow.types'

import './CollectionRow.css'

export default class CollectionRow extends React.PureComponent<Props> {
  handleNavigateToForum = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    const { collection } = this.props
    window.open(collection.forumLink!, '_blank')
    event.preventDefault()
  }

  renderCurationState = () => {
    const { collection, curation } = this.props

    if ((curation && curation.status === 'approved') || (!curation && collection.isApproved)) {
      return (
        <div className="approved action">
          <span className="action-text">{t('collection_row.approved')}</span> <UIIcon name="check" />
        </div>
      )
    }

    if ((curation && curation.status === 'rejected') || (!curation && hasReviews(collection) && !collection.isApproved)) {
      return (
        <div className="rejected action">
          <span className="action-text">{t('collection_row.rejected')}</span> <Icon name="close" />
        </div>
      )
    }

    return null
  }

  render() {
    const { collection, items, curation } = this.props
    const createdAtDate = new Date(curation?.created_at || collection.createdAt)

    return (
      <Link className="CollectionRow" to={locations.itemEditor({ collectionId: collection.id, isReviewing: 'true' })}>
        <Grid>
          <Grid.Row>
            <Grid.Column width={5}>
              <div className="image-column">
                <CollectionImage collectionId={collection.id} />
                <div className="info">
                  <div className="title">{collection.name}</div>
                  <div className="subtitle name">{t('collection_row.items', { count: items.length })}</div>
                </div>
              </div>
            </Grid.Column>
            <Grid.Column width={4}>
              <div className="title">{t('collection_row.owner')}</div>
              <div className="subtitle">
                <Profile textOnly address={collection.owner} />
              </div>
            </Grid.Column>
            <Grid.Column width={2}>
              <div className="title">{t('collection_row.forum_post')}</div>
              <div className="subtitle">
                {collection.forumLink ? (
                  <span className="link" onClick={this.handleNavigateToForum}>
                    {t('collection_row.visit')}
                  </span>
                ) : (
                  t('collection_row.no_forum_post')
                )}
              </div>
            </Grid.Column>
            <Grid.Column width={3}>
              <div className="title">{t(curation ? 'collection_row.review_request_date' : 'collection_row.publication_date')}</div>
              <div className="subtitle" title={format(createdAtDate, 'd MMMM yyyy HH:mm')}>
                {formatDistanceToNow(createdAtDate, { addSuffix: true })}
              </div>
            </Grid.Column>
            <Grid.Column width={2}>
              <div className="actions">{this.renderCurationState()}</div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Link>
    )
  }
}
