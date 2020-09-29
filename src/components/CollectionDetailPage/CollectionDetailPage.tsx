import * as React from 'react'
import { Link } from 'react-router-dom'
import { Section, Row, Back, Dropdown, Narrow, Column, Header, Button, Icon, Popup, Radio, CheckboxProps } from 'decentraland-ui'

import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import { locations } from 'routing/locations'
import { isOnSale } from 'modules/collection/utils'
import { isComplete } from 'modules/item/utils'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import ConfirmDelete from 'components/ConfirmDelete'
import Notice from 'components/Notice'
import NotFound from 'components/NotFound'
import CollectionItem from './CollectionItem'
import { Props } from './CollectionDetailPage.types'
import './CollectionDetailPage.css'

const STORAGE_KEY = 'dcl-collection-notice'

export default class CollectionDetailPage extends React.PureComponent<Props> {
  handleUpdateManagers = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('CollectionManagersModal', { collectionId: collection!.id })
  }

  handleMintItems = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('MintItemsModal', { collectionId: collection!.id })
  }

  handleNewItem = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('CreateItemModal', { collectionId: collection!.id })
  }

  handleDeleteItem = () => {
    const { collection, onDelete } = this.props
    onDelete(collection!)
  }

  handlePublish = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('PublishCollectionModal', { collectionId: collection!.id })
  }

  handleOnSaleChange = (_event: React.FormEvent<HTMLInputElement>, checkboxProps: CheckboxProps) => {
    const { collection, onOpenModal } = this.props
    const { checked } = checkboxProps
    if (collection && checked !== undefined) {
      onOpenModal('SellCollectionModal', { collectionId: collection.id, isOnSale: checked })
    }
  }

  canPublish() {
    const { items } = this.props
    return this.hasItems() && items.every(isComplete)
  }

  hasItems() {
    const { items } = this.props
    return items.length > 0
  }

  renderPage() {
    const { items, isOnSaleLoading, onOpenModal, onNavigate } = this.props
    const collection = this.props.collection!

    return (
      <>
        <Section>
          <Row>
            <Back absolute onClick={() => onNavigate(locations.avatar())} />
            <Narrow>
              <Row>
                <Column>
                  <Row>
                    <Header size="huge">{collection.name}</Header>
                  </Row>
                </Column>
                <Column align="right">
                  <Row className="actions">
                    {collection.isPublished ? (
                      <>
                        <Popup
                          content={isOnSaleLoading ? t('global.loading') : t('collection_detail_page.on_sale_popup')}
                          position="top center"
                          trigger={
                            <Radio
                              toggle
                              className="on-sale"
                              checked={isOnSale(collection)}
                              onChange={this.handleOnSaleChange}
                              label={t('collection_detail_page.on_sale')}
                              disabled={isOnSaleLoading}
                            />
                          }
                          hideOnScroll={true}
                          on="hover"
                          inverted
                          flowing
                        />

                        <Button basic className="action-button" onClick={this.handleMintItems}>
                          <Icon name="paper plane" />
                          <span>{t('collection_detail_page.mint_items')}</span>
                        </Button>
                      </>
                    ) : (
                      <Button basic className="action-button" onClick={this.handleNewItem}>
                        <Icon name="plus" />
                        <span>{t('collection_detail_page.new_item')}</span>
                      </Button>
                    )}

                    <Dropdown
                      trigger={
                        <Button basic>
                          <Icon name="ellipsis horizontal" />
                        </Button>
                      }
                      inline
                      direction="left"
                    >
                      <Dropdown.Menu>
                        {collection.isPublished ? (
                          <Dropdown.Item text={t('collection_detail_page.collaborators')} onClick={this.handleUpdateManagers} />
                        ) : (
                          <>
                            <Dropdown.Item
                              text={t('collection_detail_page.add_existing_item')}
                              onClick={() => onOpenModal('AddExistingItemModal', { collectionId: collection!.id })}
                            />
                            <ConfirmDelete
                              name={collection.name}
                              onDelete={this.handleDeleteItem}
                              trigger={<Dropdown.Item text={t('global.delete')} />}
                            />
                          </>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>

                    {collection.isPublished ? (
                      <Button secondary compact disabled={true}>
                        {t('collection_detail_page.published')}
                      </Button>
                    ) : (
                      <Button primary compact disabled={!this.canPublish()} onClick={this.handlePublish}>
                        {t('collection_detail_page.publish')}
                      </Button>
                    )}
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
                editor_link: <Link to={locations.sceneEditor()}>{t('collection_detail_page.click_here')}</Link>
              }}
            />
          </Notice>

          {this.hasItems() ? (
            <div className="collection-items">
              {items.map(item => (
                <CollectionItem key={item.id} item={item} />
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
    return (
      <LoggedInDetailPage className="CollectionDetailPage" activeTab={NavigationTab.AVATAR} isLoading={isLoading}>
        {collection === null ? <NotFound /> : this.renderPage()}
      </LoggedInDetailPage>
    )
  }
}
