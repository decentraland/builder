import * as React from 'react'
import { ModalNavigation, ModalActions, Form, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'

import { canMintItem } from 'modules/item/utils'
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
    return { items: [], itemMints }
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
      }
    })
  }

  handleMintItems = () => {
    const { collection } = this.props
    const { itemMints } = this.state
    const mints: Mint[] = []

    for (const itemMint of Object.values(itemMints)) {
      for (const mint of itemMint) {
        if (this.isValidMint(mint)) {
          mints.push(mint as Mint)
        }
      }
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

  filterAddableItems = (item: Item) => {
    const { collection, items, ethAddress } = this.props
    return item.collectionId === collection.id && !items.some(_item => _item.id === item.id && canMintItem(collection, item, ethAddress))
  }

  render() {
    const { collection, totalCollectionItems, isLoading, onClose } = this.props
    const { itemMints } = this.state

    const items = this.props.items.concat(this.state.items)

    const isEmpty = items.length === 0
    const isFull = items.length === totalCollectionItems

    return (
      <Modal name={name} className="MintItemsModal" onClose={onClose}>
        <ModalNavigation title={t('mint_items_modal.title')} onClose={onClose} />
        <Modal.Content>
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
                <Button primary onClick={this.handleMintItems} loading={isLoading}>
                  {t('global.done')}
                </Button>
              )}
            </ModalActions>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}
