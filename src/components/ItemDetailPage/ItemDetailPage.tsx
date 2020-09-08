import * as React from 'react'
import { Section, Row, Back, Narrow, Column, Header, Button, Dropdown, Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { locations } from 'routing/locations'
import { WearableData } from 'modules/item/types'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import Notice from 'components/Notice'
import ConfirmDelete from 'components/ConfirmDelete'
import ItemImage from 'components/ItemCard/ItemImage'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import NotFound from 'components/NotFound'
import { Props } from './ItemDetailPage.types'
import './ItemDetailPage.css'
import { getMissingBodyShapeType } from 'modules/item/utils'

const STORAGE_KEY = 'dcl-item-notice'

export default class ItemDetailPage extends React.PureComponent<Props> {
  handleDeleteItem = () => {
    const { item, onDelete } = this.props
    onDelete(item!)
  }

  handleAddRepresentationToItem = () => {
    const { item, onOpenModal } = this.props
    onOpenModal('CreateItemModal', { addRepresentationTo: item })
  }

  renderPage() {
    const { onNavigate } = this.props

    const item = this.props.item!
    const data = item.data as WearableData

    const missingBodyShape = getMissingBodyShapeType(item)

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
                        {missingBodyShape !== null ? (
                          <Dropdown.Item
                            text={t('item_detail_page.add_representation', { bodyShape: t(`global.representation.${missingBodyShape}`) })}
                            onClick={this.handleAddRepresentationToItem}
                          />
                        ) : null}
                        <ConfirmDelete
                          name={item.name}
                          onDelete={this.handleDeleteItem}
                          trigger={<Dropdown.Item text={t('global.delete')} />}
                        />
                      </Dropdown.Menu>
                    </Dropdown>

                    <Button primary compact onClick={() => console.log('Edit item')}>
                      {t('global.edit')}
                    </Button>
                  </Row>
                </Column>
              </Row>
            </Narrow>
          </Row>
        </Section>
        <Narrow>
          {item.collectionId === undefined ? <Notice storageKey={STORAGE_KEY}>{t('item_detail_page.notice')}</Notice> : null}
          <div className="item-data">
            <ItemImage item={item} hasBadge={true} />
            <div className="sections">
              {data.category ? (
                <Section>
                  <div className="subtitle">{t('item.category')}</div>
                  <div className="value">{data.category}</div>
                </Section>
              ) : null}
              {item.rarity ? (
                <Section>
                  <div className="subtitle">{t('item.rarity')}</div>
                  <div className="value">{item.rarity}</div>
                </Section>
              ) : null}
              {item.price ? (
                <Section>
                  <div className="subtitle">{t('item.price')}</div>
                  <div className="value">{item.price}</div>
                </Section>
              ) : null}
              {item.beneficiary ? (
                <Section>
                  <div className="subtitle">{t('item.beneficiary')}</div>
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
