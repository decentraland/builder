import * as React from 'react'
import { Link } from 'react-router-dom'
import { Section, Row, Narrow, Column, Header } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { canSeeCollection, getCollectionEditorURL } from 'modules/collection/utils'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import Notice from 'components/Notice'
import NotFound from 'components/NotFound'
import BuilderIcon from 'components/Icon'
import Back from 'components/Back'
import CollectionMenu from './CollectionMenu'
import CollectionAction from './CollectionAction'
import { Props } from './ThirdPartyCollectionDetailPage.types'

import './ThirdPartyCollectionDetailPage.css'

const STORAGE_KEY = 'dcl-third-party-collection-notice'

export default class ThirdPartyCollectionDetailPage extends React.PureComponent<Props> {
  handleEditName = () => {
    const { collection, onOpenModal } = this.props
    if (collection && !collection.isPublished) {
      onOpenModal('EditCollectionNameModal', { collection })
    }
  }

  handleGoBack = () => {
    this.props.onNavigate(locations.collections())
  }

  hasItems() {
    const { items } = this.props
    return items.length > 0
  }

  hasAccess() {
    const { wallet, collection } = this.props
    return collection !== null && canSeeCollection(collection, wallet.address)
  }

  renderPage() {
    const { wallet, items } = this.props
    const collection = this.props.collection!

    return (
      <>
        <Section className={collection.isPublished ? 'is-published' : ''}>
          <Row>
            <Back absolute onClick={this.handleGoBack} />
            <Narrow>
              <Row>
                <Column className="header-column">
                  <Row className="header-row" onClick={this.handleEditName}>
                    <Header size="huge" className="name">
                      {collection.name}
                    </Header>
                    <BuilderIcon name="edit" className="edit-collection-name" />
                  </Row>
                  <Row className="header-row">
                    <small>{collection.urn}</small>
                  </Row>
                </Column>
                <Column align="right" shrink={false} grow={false}>
                  <Row className="actions">
                    <CollectionAction collection={collection} />
                    {canSeeCollection(collection, wallet.address) ? <CollectionMenu collection={collection} /> : null}
                  </Row>
                </Column>
              </Row>
            </Narrow>
          </Row>
        </Section>
        <Narrow>
          <Notice storageKey={STORAGE_KEY}>
            <T
              id="collection_detail_page.notice"
              values={{
                editor_link: <Link to={getCollectionEditorURL(collection, items)}>{t('collection_detail_page.click_here')}</Link>
              }}
            />
          </Notice>

          {this.hasItems() ? (
            <div className="collection-items">
              {items.map(item => (
                <div>Item id: {item.id}</div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="sparkles" />
              <div>
                {t('collection_detail_page.start_adding_items')}
                <br />
                {t('collection_detail_page.cant_remove')}
              </div>
            </div>
          )}
        </Narrow>
      </>
    )
  }

  render() {
    const { isLoading } = this.props
    const hasAccess = this.hasAccess()
    return (
      <LoggedInDetailPage className="ThirdPartyCollectionDetailPage" hasNavigation={!hasAccess && !isLoading} isLoading={isLoading}>
        {hasAccess ? this.renderPage() : <NotFound />}
      </LoggedInDetailPage>
    )
  }
}
