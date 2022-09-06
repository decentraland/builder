import React from 'react'
import { ethers } from 'ethers'
import { EmoteDataADR74, Network, WearableCategory } from '@dcl/schemas'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Dropdown, Icon, Button, Mana, Table } from 'decentraland-ui'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { preventDefault } from 'lib/preventDefault'
import { isComplete, isFree, canMintItem, canManageItem, getMaxSupply } from 'modules/item/utils'
import ItemStatus from 'components/ItemStatus'
import { getExplorerURL, isLocked } from 'modules/collection/utils'
import { isEmoteData, ItemType, WearableData } from 'modules/item/types'
import ItemBadge from 'components/ItemBadge'
import RarityBadge from 'components/RarityBadge'
import ItemImage from 'components/ItemImage'
import { Props } from './CollectionItem.types'
import ResetItemButton from './ResetItemButton'
import styles from './CollectionItem.module.css'

export default class CollectionItem extends React.PureComponent<Props> {
  handleEditPriceAndBeneficiary = () => {
    const { onOpenModal, item } = this.props
    onOpenModal('EditPriceAndBeneficiaryModal', { itemId: item.id })
  }

  handleNavigateToExplorer = () => {
    const { item, isEmotesFeatureFlagOn } = this.props
    const newWindow = window.open(
      getExplorerURL({ item_ids: [item.id], hasNewEmotes: isEmotesFeatureFlagOn && item.type === ItemType.EMOTE }),
      '_blank'
    )
    if (newWindow) {
      newWindow.focus()
    }
  }

  handleMintItem = () => {
    const { onOpenModal, item } = this.props
    onOpenModal('MintItemsModal', { itemIds: [item.id] })
  }

  handleNavigateToEditor = () => {
    const { onNavigate, item, onSetItems } = this.props
    onSetItems([item])
    onNavigate(locations.itemEditor({ itemId: item.id, collectionId: item.collectionId }))
  }

  handleRemoveFromCollection = () => {
    const { item, onRemoveFromCollection } = this.props
    onRemoveFromCollection(item!, null)
  }

  renderPrice() {
    const { item } = this.props

    return item.price ? (
      <div>
        {isFree(item) ? (
          t('global.free')
        ) : (
          <Mana className={styles.mana} network={Network.MATIC}>
            {ethers.utils.formatEther(item.price)}
          </Mana>
        )}
      </div>
    ) : (
      <div className={`link ${styles.linkAction}`} onClick={preventDefault(this.handleEditPriceAndBeneficiary)}>
        {t('collection_item.set_price')}
      </div>
    )
  }

  render() {
    const { collection, item, ethAddress } = this.props
    const data = item.data as EmoteDataADR74 | WearableData

    return (
      <Table.Row className={`CollectionItem ${styles.row}`}>
        <Table.Cell className={`${styles.avatarColumn}`} width={5}>
          <Link to={locations.itemDetail(item.id)} className="CollectionItem">
            <div className={styles.avatarContainer}>
              <ItemImage className={styles.itemImage} item={item} />

              <div className={styles.info}>
                <div className={styles.nameWrapper}>
                  <div className={styles.name} title={item.name}>
                    <ItemStatus className={styles.itemStatus} item={item} />
                    {item.name}
                    <div className={styles.badgeContainer}>
                      <ItemBadge className={styles.badge} item={item} size="small"></ItemBadge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </Table.Cell>
        <Table.Cell className={styles.column}>
          {item.rarity && data.category ? <RarityBadge category={data.category as WearableCategory} rarity={item.rarity} /> : null}
        </Table.Cell>
        <Table.Cell className={styles.column}>{data.category ? <div>{t(`${item.type}.category.${data.category}`)}</div> : null}</Table.Cell>
        {item.type === ItemType.EMOTE && isEmoteData(data) ? (
          <Table.Cell className={styles.column}>
            {data.category ? <div>{t(`emote.play_mode.${data.loop ? 'loop' : 'simple'}.text`)}</div> : null}
          </Table.Cell>
        ) : null}
        <Table.Cell className={styles.column}>{this.renderPrice()}</Table.Cell>
        {item.isPublished ? (
          <Table.Cell className={styles.column}>
            <div>
              {item.totalSupply}/{getMaxSupply(item)}
            </div>
          </Table.Cell>
        ) : null}
        <Table.Cell>
          {canMintItem(collection, item, ethAddress) ? (
            <span onClick={preventDefault(this.handleMintItem)} className={`link ${styles.linkAction}`}>
              {t('collection_item.mint_item')}
            </span>
          ) : isComplete(item) ? (
            <div className={`${styles.done} ${styles.action}`}>
              {t('collection_item.done')} <Icon className={styles.check} name="check" />
            </div>
          ) : (
            <span onClick={preventDefault(this.handleNavigateToEditor)} className={`link ${styles.linkAction}`}>
              {t('collection_item.edit_item')}
            </span>
          )}
        </Table.Cell>
        <Table.Cell className={styles.column}>
          <div className={styles.itemActions}>
            <Dropdown
              trigger={
                <Button basic>
                  <Icon name="ellipsis horizontal" />
                </Button>
              }
              inline
              direction="left"
              className={styles.action}
              onClick={preventDefault()}
            >
              <Dropdown.Menu>
                <Dropdown.Item text={t('collection_item.see_details')} as={Link} to={locations.itemDetail(item.id)} />
                <Dropdown.Item text={t('collection_context_menu.see_in_world')} onClick={this.handleNavigateToExplorer} />
                <Dropdown.Item text={t('global.open_in_editor')} onClick={this.handleNavigateToEditor} />
                {canManageItem(collection, item, ethAddress) && !isLocked(collection) ? (
                  <>
                    {item.price ? (
                      <Dropdown.Item text={t('collection_item.edit_price')} onClick={this.handleEditPriceAndBeneficiary} />
                    ) : null}
                    {!item.isPublished ? (
                      <Dropdown.Item text={t('collection_item.remove_from_collection')} onClick={this.handleRemoveFromCollection} />
                    ) : null}
                    <ResetItemButton itemId={item.id} />
                  </>
                ) : null}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Table.Cell>
      </Table.Row>
    )
  }
}
