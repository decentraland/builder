import * as React from 'react'
import { Section, Row, Narrow, Column, Header, Button, Dropdown, Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { fromWei } from 'web3x-es/utils'

import { locations } from 'routing/locations'
import { WearableData } from 'modules/item/types'
import { getMaxSupply, getMissingBodyShapeType } from 'modules/item/utils'
import Notice from 'components/Notice'
import ConfirmDelete from 'components/ConfirmDelete'
import ItemImage from 'components/ItemImage'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import NotFound from 'components/NotFound'
import Back from 'components/Back'
import { Props } from './ItemDetailPage.types'
import './ItemDetailPage.css'

const STORAGE_KEY = 'dcl-item-notice'

export default class ItemDetailPage extends React.PureComponent<Props> {
  handleEditItem = () => {
    const { item, onNavigate } = this.props
    onNavigate(locations.itemEditor({ itemId: item!.id, collectionId: item!.collectionId }))
  }

  handleDeleteItem = () => {
    const { item, onDelete } = this.props
    onDelete(item!)
  }

  handleAddRepresentationToItem = () => {
    const { item, onOpenModal } = this.props
    onOpenModal('CreateItemModal', { addRepresentationTo: item })
  }

  renderPage() {
    const { collection, onNavigate } = this.props

    const item = this.props.item!
    const data = item.data as WearableData

    const missingBodyShape = getMissingBodyShapeType(item)

    return (
      <>
        <Section>
          <Row>
            <Back absolute onClick={() => onNavigate(locations.avatar())} />
            <Narrow>
              <Row className="page-header">
                <Column>
                  <Row className="header-row">
                    <Header className="name" size="huge">
                      {item.name}
                    </Header>
                  </Row>
                </Column>
                <Column align="right" shrink={false} grow={false}>
                  <Row className="actions">
                    {item.isPublished ? (
                      <Button secondary compact disabled={true}>
                        {t('global.published')}
                      </Button>
                    ) : (
                      <>
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
                                text={t('item_detail_page.add_representation', {
                                  bodyShape: t(`body_shapes.${missingBodyShape}`).toLowerCase()
                                })}
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

                        <Button primary compact onClick={this.handleEditItem}>
                          {t('global.edit')}
                        </Button>
                      </>
                    )}
                  </Row>
                </Column>
              </Row>
            </Narrow>
          </Row>
        </Section>
        <Narrow>
          {collection === null ? <Notice storageKey={STORAGE_KEY}>{t('item_detail_page.notice')}</Notice> : null}

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
                  <div className="value">{fromWei(item.price, 'ether')}</div>
                </Section>
              ) : null}
              {item.beneficiary ? (
                <Section>
                  <div className="subtitle">{t('item.beneficiary')}</div>
                  <div className="value">{item.beneficiary}</div>
                </Section>
              ) : null}
              {item.isPublished ? (
                <Section>
                  <div className="subtitle">{t('item.supply')}</div>
                  <div className="value">
                    {item.totalSupply}/{getMaxSupply(item)}
                  </div>
                </Section>
              ) : null}
              {collection ? (
                <Section>
                  <div className="subtitle">{t('item.collection')}</div>
                  <div className="value">
                    <Link to={locations.collectionDetail(collection.id)}>{collection.name}</Link>
                  </div>
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
      <LoggedInDetailPage className="ItemDetailPage" hasNavigation={false} isLoading={isLoading}>
        {item === null ? <NotFound /> : this.renderPage()}
      </LoggedInDetailPage>
    )
  }
}
