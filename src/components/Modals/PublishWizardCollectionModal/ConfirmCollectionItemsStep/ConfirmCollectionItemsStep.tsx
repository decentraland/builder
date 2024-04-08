import React from 'react'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { Network } from '@dcl/schemas'
import { Button, Column, Mana, Modal, Popup, Row, Table } from 'decentraland-ui'
import { RarityBadge } from 'decentraland-dapps/dist/containers/RarityBadge'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Item } from 'modules/item/types'
import { isFree } from 'modules/item/utils'
import ItemImage from 'components/ItemImage'
import ItemBadge from 'components/ItemBadge'
import './ConfirmCollectionItemsStep.css'

export const ConfirmCollectionItemsStep: React.FC<{ items: Item[]; onNextStep: () => void; onPrevStep: () => void }> = props => {
  const { items, onNextStep, onPrevStep } = props

  const renderPrice = (item: Item) => {
    const price = ethers.utils.formatEther(item.price!)

    return (
      <div>
        {isFree(item) ? (
          t('global.free')
        ) : (
          <Mana className="mana" network={Network.MATIC}>
            {price.length > 10 ? (
              <Popup
                className="price-popup"
                content={price}
                position="top center"
                trigger={<span>{`${price.slice(0, 3)}...${price.slice(-4)}`}</span>}
                hideOnScroll
                on="hover"
                inverted
                flowing
              />
            ) : (
              <span>{price}</span>
            )}
          </Mana>
        )}
      </div>
    )
  }

  const renderItemsTable = () => {
    return (
      <Table basic="very">
        <Table.Header className={classNames({ 'has-scrollbar': items.length > 5 })}>
          <Table.Row className="row">
            <Table.HeaderCell width={7}>{t('collection_detail_page.table.item')}</Table.HeaderCell>
            <Table.HeaderCell>{t('collection_detail_page.table.rarity')}</Table.HeaderCell>
            <Table.HeaderCell>{t('collection_detail_page.table.category')}</Table.HeaderCell>
            <Table.HeaderCell>{t('collection_detail_page.table.price')}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map(item => (
            <Table.Row key={item.id} className="CollectionItem row">
              <Table.Cell width={7} className="column avatarColumn">
                <div className="avatarContainer">
                  <ItemImage className="itemImage" item={item} hasRarityBackground={false} />
                  <div className="info">
                    <div className="name" title={item.name}>
                      {item.name}
                    </div>
                    <ItemBadge className="badge" item={item} size="small"></ItemBadge>
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell className="column">
                {item.rarity ? <RarityBadge rarity={item.rarity} size="small" withTooltip={false} /> : null}
              </Table.Cell>
              <Table.Cell className="column">
                <div>{t(`${item.type}.category.${item.data.category!}`)}</div>
              </Table.Cell>
              <Table.Cell className="column priceColumn">{renderPrice(item)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }

  return (
    <Modal.Content className="ConfirmCollectionItemsStep">
      <Column>
        <Row className="details">
          <Column grow={true}>
            <p className="title">{t('publish_wizard_collection_modal.confirm_collection_items_step.title')}</p>
            <p className="subtitle">{t('publish_wizard_collection_modal.confirm_collection_items_step.subtitle', { br: <br /> })}</p>
            <p className="description">{t('publish_wizard_collection_modal.confirm_collection_items_step.description')}</p>
            <div className="items">{renderItemsTable()}</div>
          </Column>
        </Row>
        <Row className="actions">
          <Button className="back" secondary onClick={onPrevStep}>
            {t('global.back')}
          </Button>
          <Button className="proceed" primary onClick={onNextStep}>
            {t('publish_wizard_collection_modal.confirm_collection_items_step.confirm_items')}
          </Button>
        </Row>
      </Column>
    </Modal.Content>
  )
}

export default ConfirmCollectionItemsStep
