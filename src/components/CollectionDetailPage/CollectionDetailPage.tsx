import * as React from 'react'
import { Link } from 'react-router-dom'
import { Section, Row, Back, Dropdown, Narrow, Column, Header, Button, Icon } from 'decentraland-ui'

import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import { locations } from 'routing/locations'
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

  canPublish() {
    const { items } = this.props
    return this.hasItems() && items.every(isComplete)
  }

  hasItems() {
    const { items } = this.props
    return items.length > 0
  }

  renderPage() {
    const { items, onOpenModal, onNavigate } = this.props
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
                    <Button basic className="new-item" onClick={this.handleNewItem}>
                      <Icon name="plus" /> {t('collection_detail_page.new_item')}
                    </Button>
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
                        <Dropdown.Item
                          text="Add Existing Item"
                          onClick={() => onOpenModal('AddExistingItemModal', { collectionId: collection!.id })}
                        />
                        <ConfirmDelete
                          name={collection.name}
                          onDelete={this.handleDeleteItem}
                          trigger={<Dropdown.Item text={t('global.delete')} />}
                        />
                      </Dropdown.Menu>
                    </Dropdown>

                    <Button primary compact disabled={!this.canPublish()} onClick={this.handlePublish}>
                      {t('collection_detail_page.publish')}
                    </Button>
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
                editor_link: <Link to={locations.editor()}>{t('collection_detail_page.click_here')}</Link>
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
