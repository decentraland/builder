import * as React from 'react'
import { Link } from 'react-router-dom'
import { Section, Row, Back, Dropdown, Narrow, Column, Header, Button, Confirm, Icon } from 'decentraland-ui'

import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import { locations } from 'routing/locations'
import { isComplete } from 'modules/item/utils'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import Notice from 'components/Notice'
import NotFound from 'components/NotFound'
import CollectionItem from './CollectionItem'
import { Props, State } from './CollectionDetailPage.types'
import './CollectionDetailPage.css'

const STORAGE_KEY = 'dcl-collection-notice'

export default class CollectionDetailPage extends React.PureComponent<Props, State> {
  state = {
    isConfirmOpen: false
  }

  handleToggleConfirmModal = () => {
    const { isConfirmOpen } = this.state
    this.setState({ isConfirmOpen: !isConfirmOpen })
  }

  handleDeleteItem = () => {
    const { collection, onDelete } = this.props
    onDelete(collection!)
    this.handleToggleConfirmModal()
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
    const { items, onNavigate } = this.props
    const { isConfirmOpen } = this.state
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
                        <Confirm
                          size="tiny"
                          open={isConfirmOpen}
                          content={t('collection_detail_page.confirm_delete', { name: collection.name })}
                          onCancel={this.handleToggleConfirmModal}
                          onConfirm={this.handleDeleteItem}
                        />
                        <Dropdown.Item text={t('global.delete')} onClick={this.handleToggleConfirmModal} />
                      </Dropdown.Menu>
                    </Dropdown>

                    <Button primary compact disabled={!this.canPublish()} onClick={() => console.log('Publish collection')}>
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
