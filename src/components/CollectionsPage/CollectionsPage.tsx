import * as React from 'react'
import { Container, Row, Column, Header, Card, Button, Dropdown } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { NavigationTab } from 'components/Navigation/Navigation.types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import Icon from 'components/Icon'
import { locations } from 'routing/locations'
import ItemCard from './ItemCard'
import CollectionCard from './CollectionCard'
import { Props } from './CollectionsPage.types'
import './CollectionsPage.css'

export default class CollectionsPage extends React.PureComponent<Props> {
  handleNewItem = () => {
    this.props.onOpenModal('CreateItemsModal', {})
  }

  handleNewCollection = () => {
    this.props.onOpenModal('CreateCollectionModal')
  }

  handleNewThirdPartyCollection = () => {
    this.props.onOpenModal('CreateThirdPartyCollectionModal')
  }

  handleOpenEditor = () => {
    const { onNavigate } = this.props
    onNavigate(locations.itemEditor())
  }

  renderPage() {
    const { items, collections, isThirdPartyManager } = this.props
    const count = items.length + collections.length

    return (
      <>
        <div className="filters">
          <Container>
            <Row height={30}>
              <Column>
                <Row>
                  <Header sub>{t('collections_page.results', { count })}</Header>
                </Row>
              </Column>
              <Column align="right">
                <Row className="actions">
                  <Dropdown
                    trigger={
                      <Button basic className="create-item">
                        <Icon name="add-active" />
                      </Button>
                    }
                    inline
                    direction="left"
                  >
                    <Dropdown.Menu>
                      <Dropdown.Item text={t('collections_page.new_item')} onClick={this.handleNewItem} />
                      <Dropdown.Item text={t('collections_page.new_collection')} onClick={this.handleNewCollection} />
                      {isThirdPartyManager ? (
                        <Dropdown.Item
                          text={t('collections_page.new_third_party_collection')}
                          onClick={this.handleNewThirdPartyCollection}
                        />
                      ) : null}
                    </Dropdown.Menu>
                  </Dropdown>
                  <Button className="open-editor" primary onClick={this.handleOpenEditor} size="tiny">
                    {t('item_editor.open')}
                  </Button>
                </Row>
              </Column>
            </Row>
          </Container>
        </div>

        <Card.Group>
          {count > 0 ? (
            <>
              {items.map((item, index) => (
                <ItemCard key={index} item={item} />
              ))}
              {collections.map((collection, index) => (
                <CollectionCard key={index} collection={collection} />
              ))}
            </>
          ) : (
            <div className="empty">
              <Header className="title" size="large">
                {t('collections_page.no_items')}
              </Header>
              <div className="empty-description">{t('collections_page.empty_description')}</div>
              <div className="create-new-wrapper">
                <div className="create-new create-new-item" onClick={this.handleNewItem}>
                  <div className="text">{t('collections_page.new_item')}</div>
                </div>
                <div className="create-new create-new-collection" onClick={this.handleNewCollection}>
                  <div className="text">{t('collections_page.new_collection')}</div>
                </div>
              </div>
            </div>
          )}
        </Card.Group>
      </>
    )
  }

  render() {
    const { isLoading } = this.props
    return (
      <LoggedInDetailPage className="CollectionsPage" activeTab={NavigationTab.COLLECTIONS} isLoading={isLoading}>
        {this.renderPage()}
      </LoggedInDetailPage>
    )
  }
}
