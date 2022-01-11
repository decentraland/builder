import * as React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Section, Row, Narrow, Column, Header, Button, Dropdown, Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Link } from 'react-router-dom'
import { fromWei } from 'web3x/utils'

import { locations } from 'routing/locations'
import { WearableData } from 'modules/item/types'
import { getBodyShapes, toBodyShapeType, getMaxSupply, getMissingBodyShapeType, isFree } from 'modules/item/utils'
import { isLocked as isCollectionLocked } from 'modules/collection/utils'
import Notice from 'components/Notice'
import ConfirmDelete from 'components/ConfirmDelete'
import ItemImage from 'components/ItemImage'
import ItemStatus from 'components/ItemStatus'
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

  handleChangeItemFile = () => {
    const { item, onOpenModal } = this.props
    onOpenModal('CreateItemModal', { item, changeItemFile: true })
  }

  handleAddRepresentationToItem = () => {
    const { item, onOpenModal } = this.props
    onOpenModal('CreateItemModal', { item, addRepresentation: true })
  }

  handleEditURN = () => {
    const { item, onOpenModal } = this.props
    onOpenModal('EditItemURNModal', { item })
  }

  renderPage() {
    const { collection, onNavigate } = this.props

    const item = this.props.item!
    const data = item.data as WearableData

    const missingBodyShape = getMissingBodyShapeType(item)
    const isLocked = collection && isCollectionLocked(collection)
    const hasActions = !isLocked

    return (
      <>
        <Section>
          <Row>
            <Back absolute onClick={() => onNavigate(locations.collections())} />
            <Narrow>
              <Row className="page-header">
                <Column>
                  <Row className="header-row">
                    <Header className="name" size="huge">
                      <ItemStatus item={item} />
                      {item.name}
                    </Header>
                  </Row>
                </Column>
                <Column align="right" shrink={false} grow={false}>
                  <Row className="actions">
                    <Button primary compact onClick={this.handleEditItem}>
                      {t('global.open_in_editor')}
                    </Button>

                    {hasActions ? (
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
                          {missingBodyShape ? (
                            <Dropdown.Item
                              text={t('item_detail_page.add_representation', {
                                bodyShape: t(`body_shapes.${missingBodyShape}`).toLowerCase()
                              })}
                              onClick={this.handleAddRepresentationToItem}
                            />
                          ) : (
                            <Dropdown.Item text={t('item_detail_page.change_item_file')} onClick={this.handleChangeItemFile} />
                          )}
                          {!item.isPublished ? (
                            <ConfirmDelete
                              name={item.name}
                              onDelete={this.handleDeleteItem}
                              trigger={<Dropdown.Item text={t('global.delete')} />}
                            />
                          ) : null}
                        </Dropdown.Menu>
                      </Dropdown>
                    ) : null}
                  </Row>
                </Column>
              </Row>
            </Narrow>
          </Row>
        </Section>
        <Narrow>
          {!collection ? <Notice storageKey={STORAGE_KEY}>{t('item_detail_page.notice')}</Notice> : null}

          <div className="item-data">
            <ItemImage item={item} hasBadge={true} />
            <div className="sections">
              {item.isPublished && (
                <Section>
                  <div className="subtitle">{t('item.blockchain_id')}</div>
                  <div className="value">{item.tokenId}</div>
                </Section>
              )}
              {data.category ? (
                <Section>
                  <div className="subtitle">{t('item.category')}</div>
                  <div className="value">{t(`wearable.category.${data.category}`)}</div>
                </Section>
              ) : null}
              <Section>
                <div className="subtitle">{t('item.representation')}</div>
                <div className="value">
                  {getBodyShapes(item)
                    .map(bodyShape => t(`body_shapes.${toBodyShapeType(bodyShape)}`))
                    .join(', ')}
                </div>
              </Section>
              {item.rarity ? (
                <Section>
                  <div className="subtitle">{t('item.rarity')}</div>
                  <div className="value">{item.rarity}</div>
                </Section>
              ) : null}
              {isFree(item) ? (
                <Section>
                  <div className="subtitle">{t('item.price')}</div>
                  <div className="value">{t('global.free')}</div>
                </Section>
              ) : (
                <>
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
                </>
              )}
              {item.urn ? (
                <Section>
                  <div className="subtitle">{t('global.urn')}</div>
                  <div className="value urn">
                    {item.urn}

                    <div className="urn-actions">
                      <span className="link" onClick={this.handleEditURN}>
                        {t('item.edit_urn')}
                      </span>

                      <CopyToClipboard text={item.urn!}>
                        <span className="link">{t('item.copy_urn')}</span>
                      </CopyToClipboard>
                    </div>
                  </div>
                </Section>
              ) : null}
              {item.isPublished && item.rarity ? (
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
    const { isLoading, hasAccess } = this.props
    return (
      <LoggedInDetailPage className="ItemDetailPage" hasNavigation={!hasAccess && !isLoading} isLoading={isLoading}>
        {hasAccess ? this.renderPage() : <NotFound />}
      </LoggedInDetailPage>
    )
  }
}
