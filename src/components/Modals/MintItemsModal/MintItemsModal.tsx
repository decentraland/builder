import * as React from 'react'
import classNames from 'classnames'

import { ModalNavigation, ModalActions, Form, Button, Row, Table } from 'decentraland-ui'
import { Network } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { canMintItem, MAX_NFTS_PER_MINT } from 'modules/item/utils'
import { Item } from 'modules/item/types'
import { Mint } from 'modules/collection/types'
import ItemDropdown from 'components/ItemDropdown'
import ItemImage from 'components/ItemImage'
import { Props, State, ItemMints, View } from './MintItemsModal.types'
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
    return { items: [], itemMints, error: null, confirm: View.MINT }
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
    this.setState(prevState => {
      return {
        ...prevState,
        items: [...prevState.items, item],
        itemMints: {
          ...prevState.itemMints,
          [item.id]: this.buildMints(item)
        }
      }
    })
  }

  isValidMint(mint: Partial<Mint>) {
    return !!mint.address && mint.amount && mint.amount > 0
  }

  isDisabled() {
    return Object.values(this.state.itemMints).every(mints => mints.every(mint => !mint.amount || !mint.address))
  }

  handleView = (newConfirmState: View) => this.setState({ confirm: newConfirmState })

  render() {
    const { collection, totalCollectionItems, isLoading, isEnsAddressEnabled, hasUnsyncedItems, onClose } = this.props
    const { itemMints, error, confirm } = this.state

    const items = this.props.items.concat(this.state.items)

    const isEmpty = items.length === 0
    const isFull = items.length === totalCollectionItems
    const isDisabled = this.isDisabled()

    const totalMints = Object.values(itemMints).reduce((accumulator, mints) => {
      const totalMintsPerItem = mints.reduce((acc, mint) => {
        const amount = mint.amount || 0
        return acc + amount
      }, 0)
      return accumulator + totalMintsPerItem
    }, 0)

    // ! this function goes inside render to re-trigger the rendering of the item dropdown when the selection of items changes
    const filterAddableItems = (item: Item) => {
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

    return (
      <Modal className="MintItemsModal" onClose={onClose}>
        <ModalNavigation title={t('mint_items_modal.title')} onClose={onClose} />
        <Modal.Content>
          {hasUnsyncedItems(items) && <p className="unsynced-warning danger-text">{t('mint_items_modal.unsynced_warning')}</p>}
          {confirm === View.CONFIRM ? (
            <div className="ConfirmationStepContainer">
              <span>
                {t('mint_items_modal.confirm_title', {
                  count: totalMints
                })}
              </span>
              <Table basic="very">
                <Table.Header className={classNames({ 'has-scrollbar': items.length > 5 })}>
                  <Table.Row className="row">
                    <Table.HeaderCell width={5}>{t('global.item')}</Table.HeaderCell>
                    <Table.HeaderCell width={7}>{t('global.address')}</Table.HeaderCell>
                    <Table.HeaderCell width={2}>
                      <span className="amountText">{t('global.amount')}</span>
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {Object.values(itemMints).map(mintsItemList => {
                    return mintsItemList.map((mintsItem, index) => {
                      const { item, address, amount } = mintsItem
                      return (
                        amount && (
                          <Table.Row key={index} className="CollectionItem row">
                            <Table.Cell width={5}>
                              <div className="itemContainer">
                                {item && <ItemImage item={item} className="itemImage" />}
                                {item?.name}
                              </div>
                            </Table.Cell>
                            <Table.Cell width={7}>
                              <span className="beneficary">{address}</span>
                            </Table.Cell>
                            <Table.Cell width={2}>
                              <span className="amountText">{amount}</span>
                            </Table.Cell>
                          </Table.Row>
                        )
                      )
                    })
                  })}
                </Table.Body>
              </Table>

              <Row className="actions" align="right">
                <Button className="back" secondary onClick={() => this.handleView(View.MINT)}>
                  {t('global.back')}
                </Button>

                <NetworkButton
                  primary
                  onClick={this.handleMintItems}
                  loading={isLoading}
                  disabled={isDisabled || !!error}
                  network={Network.MATIC}
                >
                  {t('global.mint')}
                </NetworkButton>
              </Row>
            </div>
          ) : (
            <Form>
              {isEmpty ? (
                <div className="empty">{t('mint_items_modal.no_items', { name: collection.name })}</div>
              ) : (
                items.map(item => (
                  <MintableItem
                    key={item.id}
                    item={item}
                    mints={itemMints[item.id]}
                    onChange={this.handleMintsChange}
                    isEnsAddressEnabled={isEnsAddressEnabled}
                  />
                ))
              )}
              {isFull ? null : (
                <ItemDropdown placeholder={t('mint_items_modal.add_item')} onChange={this.handleAddItems} filter={filterAddableItems} />
              )}
              <ModalActions>
                {isEmpty ? (
                  <Button secondary fluid onClick={onClose}>
                    {t('global.cancel')}
                  </Button>
                ) : (
                  <Button primary onClick={() => this.handleView(View.CONFIRM)} disabled={isDisabled}>
                    {t('mint_items_modal.next')}
                  </Button>
                )}
              </ModalActions>
              {error ? (
                <Row className="error" align="right">
                  <p className="danger-text">{error}</p>
                </Row>
              ) : null}
            </Form>
          )}
        </Modal.Content>
      </Modal>
    )
  }
}
