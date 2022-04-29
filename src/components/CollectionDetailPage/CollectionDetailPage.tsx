import * as React from 'react'
import { Link } from 'react-router-dom'
import { Network } from '@dcl/schemas'
import { Section, Row, Narrow, Column, Header, Button, Icon, Popup, Radio, CheckboxProps } from 'decentraland-ui'
import { NetworkCheck } from 'decentraland-dapps/dist/containers'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import {
  canMintCollectionItems,
  canSeeCollection,
  getCollectionEditorURL,
  isOnSale as isCollectionOnSale,
  isLocked as isCollectionLocked,
  isOwner
} from 'modules/collection/utils'
import CollectionProvider from 'components/CollectionProvider'
import { Item } from 'modules/item/types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import Notice from 'components/Notice'
import NotFound from 'components/NotFound'
import BuilderIcon from 'components/Icon'
import Back from 'components/Back'
import CollectionStatus from 'components/CollectionStatus'
import CollectionPublishButton from './CollectionPublishButton'
import CollectionContextMenu from './CollectionContextMenu'
import CollectionItem from './CollectionItem'
import { Props } from './CollectionDetailPage.types'

import './CollectionDetailPage.css'

const STORAGE_KEY = 'dcl-collection-notice'

export default class CollectionDetailPage extends React.PureComponent<Props> {
  handleMintItems = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('MintItemsModal', { collectionId: collection!.id })
  }

  handleNewItem = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('CreateSingleItemModal', { collectionId: collection!.id })
  }

  handleEditName = () => {
    const { collection, onOpenModal } = this.props
    if (collection && !collection.isPublished) {
      onOpenModal('EditCollectionNameModal', { collection })
    }
  }

  handleOnSaleChange = (_event: React.FormEvent<HTMLInputElement>, checkboxProps: CheckboxProps) => {
    const { collection, onOpenModal } = this.props
    const { checked } = checkboxProps
    if (collection && checked !== undefined) {
      onOpenModal('SellCollectionModal', { collectionId: collection.id, isOnSale: checked })
    }
  }

  handleGoBack = () => {
    this.props.onNavigate(locations.collections())
  }

  hasItems(items: Item[]) {
    return items.length > 0
  }

  hasAccess() {
    const { wallet, collection } = this.props
    return collection !== null && canSeeCollection(collection, wallet.address)
  }

  renderPage(items: Item[]) {
    const { wallet, isOnSaleLoading } = this.props
    const collection = this.props.collection!

    const canMint = canMintCollectionItems(collection, wallet.address)
    const isOnSale = isCollectionOnSale(collection, wallet)
    const isLocked = isCollectionLocked(collection)

    return (
      <>
        <Section className={collection.isPublished ? 'is-published' : ''}>
          <Row>
            <Back absolute onClick={this.handleGoBack} />
            <Narrow>
              <Row>
                <Column className="header-column">
                  {isLocked ? (
                    <Header size="huge" className="name">
                      {collection.isPublished && <CollectionStatus collection={collection} />}
                      {collection.name}
                    </Header>
                  ) : (
                    <Row className="header-row" onClick={this.handleEditName}>
                      <Header size="huge" className="name">
                        {collection.name}
                      </Header>
                      <BuilderIcon name="edit" className="edit-collection-name" />
                    </Row>
                  )}
                </Column>
                <Column align="right" shrink={false} grow={false}>
                  <Row className="actions">
                    {collection.isPublished ? (
                      <>
                        {isOwner(collection, wallet.address) ? (
                          <Popup
                            content={
                              isOnSaleLoading
                                ? t('global.loading')
                                : isOnSale
                                ? t('collection_detail_page.unset_on_sale_popup')
                                : t('collection_detail_page.set_on_sale_popup')
                            }
                            position="top center"
                            trigger={
                              <NetworkCheck network={Network.MATIC}>
                                {isEnabled => (
                                  <Radio
                                    toggle
                                    className="on-sale"
                                    checked={isOnSale}
                                    onChange={this.handleOnSaleChange}
                                    label={t('collection_detail_page.on_sale')}
                                    disabled={isOnSaleLoading || !isEnabled}
                                  />
                                )}
                              </NetworkCheck>
                            }
                            hideOnScroll={true}
                            on="hover"
                            inverted
                            flowing
                          />
                        ) : null}

                        <Button basic className="action-button" disabled={!canMint} onClick={this.handleMintItems}>
                          <Icon name="paper plane" />
                          <span className="text">{t('collection_detail_page.mint_items')}</span>
                        </Button>
                      </>
                    ) : (
                      <Button basic className="action-button" disabled={isLocked} onClick={this.handleNewItem}>
                        <Icon name="plus" />
                        <span className="text">{t('collection_detail_page.new_item')}</span>
                      </Button>
                    )}

                    {canSeeCollection(collection, wallet.address) ? <CollectionContextMenu collection={collection} /> : null}

                    <CollectionPublishButton collection={collection} />
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
                editor_link: <Link to={getCollectionEditorURL(collection, items)}>{t('global.click_here')}</Link>
              }}
            />
          </Notice>

          {this.hasItems(items) ? (
            <div className="collection-items">
              {items.map(item => (
                <CollectionItem key={item.id} collection={collection} item={item} />
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
    const { isLoading, collection } = this.props
    const hasAccess = this.hasAccess()
    const HUGE_PAGE_SIZE = 5000 // TODO: Remove this ASAP and implement pagination
    return (
      <CollectionProvider id={collection?.id} itemsPage={1} itemsPageSize={HUGE_PAGE_SIZE}>
        {({ isLoading: isLoadingCollectionData, items }) => (
          <LoggedInDetailPage
            className="CollectionDetailPage"
            hasNavigation={!hasAccess && !isLoading && !isLoadingCollectionData}
            isLoading={isLoading || isLoadingCollectionData}
          >
            {hasAccess ? this.renderPage(items) : <NotFound />}
          </LoggedInDetailPage>
        )}
      </CollectionProvider>
    )
  }
}
