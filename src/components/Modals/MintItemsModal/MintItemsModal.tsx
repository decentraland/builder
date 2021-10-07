import * as React from 'react'
import { ModalNavigation, ModalActions, Form, Button, Row } from 'decentraland-ui'
import { Network } from '@dcl/schemas'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import { ChainButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { canMintItem, MAX_NFTS_PER_MINT } from 'modules/item/utils'
import { Item } from 'modules/item/types'
import { Mint } from 'modules/collection/types'
import ItemDropdown from 'components/ItemDropdown'
import { Props, State, ItemMints } from './MintItemsModal.types'
import MintableItem from './MintableItem'

import './MintItemsModal.css'

export default class MintItemsModal extends React.PureComponent<Props, State> {
  state: State = this.getInitialState()

  getInitialState(): State {
    const { items } = this.props
    const itemMints: ItemMints = {}
    for (const item of items) {
      itemMints[item.id] = this.buildMints(item)
    }
    return { items: [], itemMints, error: null }
  }

  buildMints(item: Item): Partial<Mint>[] {
    return [{ item }]
  }

  handleMintsChange = (item: Item, mints: Partial<Mint>[]) => {
    const { itemMints } = this.state
    this.setState({
      itemMints: {
        ...itemMints,
        [item.id]: mints
      },
      error: null
    })
  }

  handleMintItems = () => {
    const { collection } = this.props
    const { itemMints } = this.state
    const mints: Mint[] = []

    let total = 0
    for (const itemMint of Object.values(itemMints)) {
      for (const mint of itemMint) {
        if (this.isValidMint(mint)) {
          mints.push(mint as Mint)
          total += mint.amount!
        }
      }
    }

    if (total > MAX_NFTS_PER_MINT) {
      this.setState({ error: t('mint_items_modal.limit_reached', { max: MAX_NFTS_PER_MINT }) })
      return
    } else {
      this.setState({ error: null })
    }

    if (mints.length > 0) {
      this.props.onMint(collection, mints)
    }
  }

  handleAddItems = (item: Item) => {
    const { items, itemMints } = this.state
    this.setState({
      items: [...items, item],
      itemMints: {
        ...itemMints,
        [item.id]: this.buildMints(item)
      }
    })
  }

  isValidMint(mint: Partial<Mint>) {
    return !!mint.address && mint.amount && mint.amount > 0
  }

  isDisabled() {
    return Object.values(this.state.itemMints).every(mints => mints.every(mint => !mint.amount || !mint.address))
  }

  filterAddableItems = (item: Item) => {
    const { collection, items, ethAddress } = this.props
    const { items: selectedItems } = this.state

    const itemBelongsToCollection = item.collectionId === collection.id
    const itemIsNotAlreadySelected = !selectedItems.some(_item => _item.id === item.id)

    return (
      itemBelongsToCollection &&
      !items.some(_item => _item.id === item.id && canMintItem(collection, item, ethAddress)) &&
      itemIsNotAlreadySelected
    )
  }

  render() {
    const { collection, totalCollectionItems, isLoading, hasUnsyncedItems, onClose } = this.props
    const { itemMints, error } = this.state

    const items = this.props.items.concat(this.state.items)

    const isEmpty = items.length === 0
    const isFull = items.length === totalCollectionItems
    const isDisabled = this.isDisabled()

    return (
      <Modal className="MintItemsModal" onClose={onClose}>
        <ModalNavigation title={t('mint_items_modal.title')} onClose={onClose} />
        <Modal.Content>
          {hasUnsyncedItems(items) && <p className="unsynced-warning danger-text">{t('mint_items_modal.unsynced_warning')}</p>}
          <Form>
            {isEmpty ? (
              <div className="empty">{t('mint_items_modal.no_items', { name: collection.name })}</div>
            ) : (
              items.map(item => <MintableItem key={item.id} item={item} mints={itemMints[item.id]} onChange={this.handleMintsChange} />)
            )}
            {isFull ? null : (
              <ItemDropdown placeholder={t('mint_items_modal.add_item')} onChange={this.handleAddItems} filter={this.filterAddableItems} />
            )}
            <ModalActions>
              {isEmpty ? (
                <Button secondary fluid onClick={onClose}>
                  {t('global.cancel')}
                </Button>
              ) : (
                <ChainButton
                  primary
                  onClick={this.handleMintItems}
                  loading={isLoading}
                  disabled={isDisabled || !!error}
                  chainId={getChainIdByNetwork(Network.MATIC)}
                >
                  {t('global.mint')}
                </ChainButton>
              )}
            </ModalActions>
            {error ? (
              <Row className="error" align="right">
                <p className="danger-text">{error}</p>
              </Row>
            ) : null}
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}
