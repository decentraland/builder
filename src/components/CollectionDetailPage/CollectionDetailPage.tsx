import * as React from 'react'
import { Section, Row, Back, Narrow, Column, Header, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { locations } from 'routing/locations'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import NotFound from 'components/NotFound'
import CollectionItem from './CollectionItem'
import { Props } from './CollectionDetailPage.types'
import './CollectionDetailPage.css'

export default class CollectionDetailPage extends React.PureComponent<Props> {
  renderPage() {
    const { items, onNavigate } = this.props
    const collection = this.props.collection!

    const hasItems = items.length > 0

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
                  <Row>
                    <Button primary disabled={!hasItems} onClick={() => console.log('Publish collection')}>
                      {t('collection_detail_page.publish')}
                    </Button>
                  </Row>
                </Column>
              </Row>
            </Narrow>
          </Row>
        </Section>
        <Narrow>
          {hasItems ? (
            <div className="collection-items">
              {items.map(item => (
                <CollectionItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="sparkles" />
              <p>
                Looking good! now you can start adding items to your collection.
                <br />
                You will not be able to remove or add items to your collection once its published.
              </p>
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
