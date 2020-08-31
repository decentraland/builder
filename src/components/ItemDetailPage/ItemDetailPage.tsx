import * as React from 'react'
import { Section, Row, Back, Narrow, Column, Header, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { locations } from 'routing/locations'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import Icon from 'components/Icon'
import ItemImage from 'components/ItemCard/ItemImage'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import NotFound from 'components/NotFound'
import { Props } from './ItemDetailPage.types'
import './ItemDetailPage.css'

const STORAGE_KEY = 'dcl-item-notice'

export default class ItemDetailPage extends React.PureComponent<Props> {
  state = {
    isNoticeClosed: localStorage.getItem(STORAGE_KEY) !== null
  }

  handleCloseNotice = () => {
    this.setState({ isNoticeClosed: true })
    localStorage.setItem(STORAGE_KEY, '1')
  }

  renderPage() {
    const { onNavigate } = this.props
    const { isNoticeClosed } = this.state
    const item = this.props.item!

    return (
      <>
        <Section>
          <Row>
            <Back absolute onClick={() => onNavigate(locations.avatar())} />
            <Narrow>
              <Row>
                <Column>
                  <Row>
                    <Header size="huge">{item.name}</Header>
                  </Row>
                </Column>
                <Column align="right">
                  <Row>
                    <Button primary onClick={() => console.log('Edit item')}>
                      {t('item_detail_page.edit')}
                    </Button>
                  </Row>
                </Column>
              </Row>
            </Narrow>
          </Row>
        </Section>
        <Narrow>
          {item.collectionId === undefined && !isNoticeClosed ? (
            <div className="notice">
              <div className="text">You need to add your items to a collection before you can publish them</div>
              <Icon name="close" onClick={this.handleCloseNotice} />
            </div>
          ) : null}
          <div className="item-data">
            <ItemImage item={item} />
            <div className="sections">
              {item.type ? (
                <Section>
                  <div className="subtitle">{t('item_detail_page.category')}</div>
                  <div className="value">{item.type}</div>
                </Section>
              ) : null}
              {item.rarity ? (
                <Section>
                  <div className="subtitle">{t('item_detail_page.rarity')}</div>
                  <div className="value">{item.rarity}</div>
                </Section>
              ) : null}
              {item.price ? (
                <Section>
                  <div className="subtitle">{t('item_detail_page.price')}</div>
                  <div className="value">{item.price}</div>
                </Section>
              ) : null}
              {item.beneficiary ? (
                <Section>
                  <div className="subtitle">{t('item_detail_page.beneficiary')}</div>
                  <div className="value">{item.beneficiary}</div>
                </Section>
              ) : null}
            </div>
          </div>
        </Narrow>
      </>
    )
  }

  render() {
    const { isLoading, item } = this.props
    return (
      <LoggedInDetailPage className="ItemDetailPage" activeTab={NavigationTab.AVATAR} isLoading={isLoading}>
        {item === null ? <NotFound /> : this.renderPage()}
      </LoggedInDetailPage>
    )
  }
}
