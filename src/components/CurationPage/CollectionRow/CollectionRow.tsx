import React from 'react'
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

  render() {
    const { collection, items } = this.props

    return (
      <Link className="CollectionRow" to={locations.itemEditor({ collectionId: collection.id, isReviewing: 'true' })}>
        <Grid>
          <Grid.Row>
            <Grid.Column width={5}>
              <div className="image-column">
                <CollectionImage collection={collection} />
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
            <Grid.Column width={4}>
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
            <Grid.Column width={2}>
              <div className="title">{t('collection_row.published_time_title')}</div>
              <div className="subtitle">{formatDistanceToNow(new Date(collection.createdAt))}</div>
            </Grid.Column>
            <Grid.Column width={3}>
              <div className="actions">
                {collection.isApproved ? (
                  <div className="approved action">
                    <span className="action-text">{t('collection_row.approved')}</span> <UIIcon name="check" />
                  </div>
                ) : hasReviews(collection) ? (
                  <div className="rejected action">
                    <span className="action-text">{t('collection_row.rejected')}</span> <Icon name="close" />
                  </div>
                ) : null}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Link>
    )
  }
}
