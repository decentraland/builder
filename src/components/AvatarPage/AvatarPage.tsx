import * as React from 'react'
import { Container, Row, Column, Header, Card, Button, Dropdown } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { NavigationTab } from 'components/Navigation/Navigation.types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import ItemCard from 'components/ItemCard'
import CollectionCard from 'components/CollectionCard'
import Icon from 'components/Icon'
import { Props } from './AvatarPage.types'
import './AvatarPage.css'

export default class AvatarPage extends React.PureComponent<Props> {
  renderPage() {
    const { items, collections, onOpenModal } = this.props
    const count = items.length + collections.length

    return (
      <>
        <div className="filters">
          <Container>
            <Row height={30}>
              <Column>
                <Row>
                  <Header sub>{t('avatar_page.results', { count })}</Header>
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
                      <Dropdown.Item text={t('avatar_page.new_item')} onClick={() => onOpenModal('CreateItemModal')} />
                      <Dropdown.Item text={t('avatar_page.new_collection')} onClick={() => onOpenModal('CreateCollectionModal')} />
                    </Dropdown.Menu>
                  </Dropdown>
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
                {t('avatar_page.no_items')}
              </Header>
              <div className="empty-description">{t('avatar_page.empty_description')}</div>
              <div className="create-new-wrapper">
                <div className="create-new create-new-item" onClick={() => onOpenModal('CreateItemModal')}>
                  <div className="text">{t('avatar_page.new_item')}</div>
                </div>
                <div className="create-new create-new-collection" onClick={() => onOpenModal('CreateCollectionModal')}>
                  <div className="text">{t('avatar_page.new_collection')}</div>
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
      <LoggedInDetailPage className="AvatarPage" activeTab={NavigationTab.AVATAR} isLoading={isLoading}>
        {this.renderPage()}
      </LoggedInDetailPage>
    )
  }
}
