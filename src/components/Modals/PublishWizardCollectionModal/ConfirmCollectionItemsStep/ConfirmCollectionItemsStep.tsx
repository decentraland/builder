import React from 'react'
import { Button, Column, Loader, Mana, Modal, Row, Table } from 'decentraland-ui'
import { Props } from '../PublishWizardCollectionModal.types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import CollectionProvider from 'components/CollectionProvider'
import { Item } from 'modules/item/types'

import './ConfirmCollectionItemsStep.css'
import ItemImage from 'components/ItemImage'
import ItemBadge from 'components/ItemBadge'
import RarityBadge from 'components/RarityBadge'
import { isFree } from 'modules/item/utils'
import { Network } from '@dcl/schemas'
import { ethers } from 'ethers'

const HUGE_PAGE_SIZE = 20

export const ConfirmCollectionItemsStep: React.FC<Pick<Props, 'collection'> & { onNextStep: () => void }> = props => {
  const { collection, onNextStep } = props

  const renderPrice = (item: Item) => {
    return (
      <div>
        {isFree(item) ? (
          t('global.free')
        ) : (
          <Mana className="mana" network={Network.MATIC}>
            {ethers.utils.formatEther(item.price!)}
          </Mana>
        )}
      </div>
    )
  }

  const renderItemsTable = (items: Item[]) => {
    return (
      <Table basic="very" columns={4}>
        <Table.Header>
          <Table.HeaderCell width={5}>{t('collection_detail_page.table.item')}</Table.HeaderCell>
          <Table.HeaderCell>{t('collection_detail_page.table.rarity')}</Table.HeaderCell>
          <Table.HeaderCell>{t('collection_detail_page.table.category')}</Table.HeaderCell>
          <Table.HeaderCell>{t('collection_detail_page.table.price')}</Table.HeaderCell>
        </Table.Header>
        <Table.Body>
          {items.map(item => (
            <Table.Row key={item.id} className="CollectionItem row">
              <Table.Cell className="avatarColumn">
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
                <RarityBadge category={item.data.category!} rarity={item.rarity!} size="small" />
              </Table.Cell>
              <Table.Cell className="column">
                <div>{t(`${item.type}.category.${item.data.category}`)}</div>
              </Table.Cell>
              <Table.Cell className="column priceColumn">{renderPrice(item)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }

  return (
    <>
      <Modal.Content className="ConfirmCollectionItemsStep">
        <Column>
          <Row className="details">
            <Column grow={true}>
              <p className="title">{t('publish_collection_modal_with_oracle.confirm_collection_items_step.title')}</p>
              <p className="subtitle">
                {t('publish_collection_modal_with_oracle.confirm_collection_items_step.subtitle', { enter: <br /> })}
              </p>
              <p className="description">{t('publish_collection_modal_with_oracle.confirm_collection_items_step.description')}</p>
              <div className="items">
                <CollectionProvider id={collection?.id} itemsPage={1} itemsPageSize={HUGE_PAGE_SIZE}>
                  {({ isLoading, items }) => {
                    if (isLoading) {
                      return <Loader active size="medium" inline />
                    }
                    return renderItemsTable(items)
                  }}
                </CollectionProvider>
              </div>
            </Column>
          </Row>
          <Row className="actions" align="right">
            <Button className="proceed" primary onClick={onNextStep}>
              {t('publish_collection_modal_with_oracle.confirm_collection_items_step.confirm_items')}
            </Button>
          </Row>
        </Column>
      </Modal.Content>
    </>
  )
}

export default ConfirmCollectionItemsStep
