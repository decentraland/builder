import * as React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Section, Row, Narrow, Column, Header, Icon, Button } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { canSeeCollection } from 'modules/collection/utils'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import Notice from 'components/Notice'
import NotFound from 'components/NotFound'
import BuilderIcon from 'components/Icon'
import Back from 'components/Back'
import CollectionContextMenu from './CollectionContextMenu'
import CollectionPublishButton from './CollectionPublishButton'
import { Props } from './ThirdPartyCollectionDetailPage.types'

import './ThirdPartyCollectionDetailPage.css'
import CollectionItem from './CollectionItem'

const STORAGE_KEY = 'dcl-third-party-collection-notice'

export default class ThirdPartyCollectionDetailPage extends React.PureComponent<Props> {
  handleEditName = () => {
    const { collection, onOpenModal } = this.props
    if (collection) {
      onOpenModal('EditCollectionNameModal', { collection })
    }
  }

  handleBuySlot = () => {
    // onOpenModal('BuySlotModal', {})
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
    const slots = 0

    return (
      <>
        <Section>
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
                  <Row>
                    <small className="urn">
                      <CopyToClipboard text={collection.urn!}>
                        <div>
                          {collection.urn}
                          <Icon aria-label="Copy urn" aria-hidden="false" className="link copy" name="copy outline" />
                        </div>
                      </CopyToClipboard>
                    </small>
                  </Row>
                </Column>
                <Column align="right" shrink={false}>
                  <Row className="actions">
                    <Button secondary compact className={`${slots <= 0 ? 'empty' : ''} slots`} onClick={this.handleBuySlot}>
                      {t('third_party_collection_detail_page.slots', { amount: slots })}
                      {slots <= 0 ? (
                        <span className="buy-slots link" onClick={this.handleBuySlot}>
                          {t('global.buy')}
                        </span>
                      ) : null}
                    </Button>
                    <CollectionPublishButton collection={collection} />
                    {canSeeCollection(collection, wallet.address) ? <CollectionContextMenu collection={collection} /> : null}
                  </Row>
                </Column>
              </Row>
            </Narrow>
          </Row>
        </Section>
        <Narrow>
          <Notice storageKey={STORAGE_KEY}>
            <T
              id="third_party_collection_detail_page.notice"
              values={{
                buy_link: (
                  <span className="link" onClick={this.handleBuySlot}>
                    {t('global.click_here')}
                  </span>
                )
              }}
            />
          </Notice>

          {this.hasItems() ? (
            <div className="collection-items">
              {items.map(item => (
                <CollectionItem key={item.id} collection={collection} item={item} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="sparkles" />
              <div>
                {t('third_party_collection_detail_page.start_adding_items')}
                <br />
                {t('third_party_collection_detail_page.cant_remove')}
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
