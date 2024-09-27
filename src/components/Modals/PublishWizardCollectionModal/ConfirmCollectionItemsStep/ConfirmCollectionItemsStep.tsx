import React, { useCallback } from 'react'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { EmoteDataADR74, Network } from '@dcl/schemas'
import { Button, Column, IconBadge, Loader, Mana, Modal, Popup, Row, Table } from 'decentraland-ui'
import { RarityBadge } from 'decentraland-dapps/dist/containers/RarityBadge'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Item } from 'modules/item/types'
import { getMapping, isEmote, isFree } from 'modules/item/utils'
import { Collection } from 'modules/collection/types'
import ItemImage from 'components/ItemImage'
import ItemBadge from 'components/ItemBadge'
import { MappingEditor } from 'components/MappingEditor'
import styles from './ConfirmCollectionItemsStep.module.css'

export const ConfirmCollectionItemsStep: React.FC<{
  items: Item[]
  onNextStep: () => void
  onPrevStep: () => void
  isSigningCheque: boolean
  isThirdParty: boolean
  collection: Collection
}> = props => {
  const { items, collection, onNextStep, onPrevStep, isSigningCheque, isThirdParty } = props
  const isCollectionLinked = collection.linkedContractAddress && collection.linkedContractNetwork

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
                className={styles.pricePopup}
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

  const renderThirdPartyItemsTable = useCallback(
    () => (
      <Table basic="very">
        <Table.Header className={classNames({ [styles.hasScrollBar]: items.length > 5 })}>
          <Table.Row>
            <Table.HeaderCell width={1}></Table.HeaderCell>
            <Table.HeaderCell width={5}>{t('collection_detail_page.table.item')}</Table.HeaderCell>
            <Table.HeaderCell width={1}></Table.HeaderCell>
            <Table.HeaderCell>Linked to</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((item, index) => {
            const itemMapping = getMapping(item)
            return (
              <Table.Row key={item.id}>
                <Table.Cell width={1}>
                  <div className={styles.itemNumber}>{index + 1}</div>
                </Table.Cell>
                <Table.Cell width={5} className={classNames(styles.column, styles.avatarColumn)}>
                  <div className={styles.avatarContainer}>
                    <ItemImage className={styles.itemImage} item={item} />
                    <div className={styles.info}>
                      <div className={styles.name} title={item.name}>
                        {item.name}
                      </div>
                      <ItemBadge className={styles.badge} item={item} size="small" />
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell width={1}>
                  <IconBadge className={classNames(styles.categoryBadge, styles.thirdParty)} icon={item.data.category} />
                </Table.Cell>
                <Table.Cell className={styles.mapping}>
                  {itemMapping && <MappingEditor mapping={itemMapping} onChange={() => undefined} disabled isCompact />}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    ),
    [items]
  )

  const renderItemsTable = () => {
    return (
      <Table basic="very">
        <Table.Header className={classNames({ [styles.hasScrollBar]: items.length > 5 })}>
          <Table.Row>
            <Table.HeaderCell width={1}></Table.HeaderCell>
            <Table.HeaderCell width={7}>{t('collection_detail_page.table.item')}</Table.HeaderCell>
            <Table.HeaderCell>{t('collection_detail_page.table.rarity')}</Table.HeaderCell>
            <Table.HeaderCell>{t('collection_detail_page.table.category')}</Table.HeaderCell>
            <Table.HeaderCell>{t('collection_detail_page.table.price')}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((item, index) => (
            <Table.Row key={item.id}>
              <Table.Cell width={1}>
                <div className={styles.itemNumber}>{index + 1}</div>
              </Table.Cell>
              <Table.Cell width={7} className={classNames(styles.column, styles.avatarColumn)}>
                <div className={styles.avatarContainer}>
                  <ItemImage className={styles.itemImage} item={item} />
                  <div className={styles.info}>
                    <div className={styles.name} title={item.name}>
                      {item.name}
                    </div>
                    <ItemBadge className={styles.badge} item={item} size="small" />
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell>{item.rarity ? <RarityBadge rarity={item.rarity} size="small" withTooltip={false} /> : null}</Table.Cell>
              <Table.Cell>
                <IconBadge
                  className={styles.categoryBadge}
                  icon={isEmote(item) ? ((item.data as EmoteDataADR74).loop ? 'play-loop' : 'play-once') : item.data.category}
                  text={t(`${item.type}.category.${item.data.category!}`)}
                ></IconBadge>
              </Table.Cell>
              <Table.Cell className={styles.priceColumn}>{renderPrice(item)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }

  return (
    <Modal.Content>
      <Column>
        <Row className={styles.details}>
          {isSigningCheque && (
            <div className={styles.loadingOverlay}>
              <Loader inline size="massive" />
              {t('publish_wizard_collection_modal.accept_in_wallet')}
            </div>
          )}
          <Column grow={true}>
            <p className={styles.title}>{t('publish_wizard_collection_modal.confirm_collection_items_step.title')}</p>
            <p className={styles.subtitle}>
              {t(`publish_wizard_collection_modal.confirm_collection_items_step.${isThirdParty ? 'third_party' : 'standard'}.subtitle`, {
                br: <br />
              })}
            </p>
            <p className={styles.description}>
              {t(`publish_wizard_collection_modal.confirm_collection_items_step.${isThirdParty ? 'third_party' : 'standard'}.description`)}
            </p>
            <div className={styles.items}>{isCollectionLinked && isThirdParty ? renderThirdPartyItemsTable() : renderItemsTable()}</div>
          </Column>
        </Row>
        <Row className={styles.actions}>
          <Button className="back" secondary disabled={isSigningCheque} onClick={onPrevStep}>
            {t('global.back')}
          </Button>
          <Button className="proceed" primary disabled={isSigningCheque} onClick={onNextStep}>
            {t('publish_wizard_collection_modal.confirm_collection_items_step.confirm_items')}
          </Button>
        </Row>
      </Column>
    </Modal.Content>
  )
}

export default ConfirmCollectionItemsStep
