import * as React from 'react'
import { Container, Row, Column, Header, Card, Button, Dropdown, Table, Section } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { NavigationTab } from 'components/Navigation/Navigation.types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import Icon from 'components/Icon'
import { locations } from 'routing/locations'
// import ItemCard from './ItemCard'
// import CollectionCard from './CollectionCard'
import { Props } from './CollectionsPage.types'
import './CollectionsPage.css'
import CollectionImage from 'components/CollectionImage'

export default class CollectionsPage extends React.PureComponent<Props> {
  handleNewItem = () => {
    this.props.onOpenModal('CreateSingleItemModal', {})
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

        {count > 0 ? (
          <Section>
            <Table basic="very">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Item</Table.HeaderCell>
                  <Table.HeaderCell>Type</Table.HeaderCell>
                  <Table.HeaderCell>Items</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {collections.map(collection => (
                  <Table.Row>
                    <Table.Cell width={5}>
                      <CollectionImage collectionId={collection.id} /> {collection.name}
                    </Table.Cell>
                    <Table.Cell>Collection</Table.Cell>
                    <Table.Cell>1</Table.Cell>
                    <Table.Cell>Published | ...</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Section>
        ) : (
          <Card.Group>
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
          </Card.Group>
        )}
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
