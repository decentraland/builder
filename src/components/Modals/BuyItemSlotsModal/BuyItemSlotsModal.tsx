import * as React from 'react'
import BN from 'bn.js'
import { env } from 'decentraland-commons'
import { fromWei } from 'web3x/utils'
import { Network } from '@dcl/schemas'
import { Button, ModalDescription, ModalHeader, CheckboxProps, Mana, Loader, Message, Field, Radio } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Modal, NetworkButton } from 'decentraland-dapps/dist/containers'
import { Props, State } from './BuyItemSlotsModal.types'
import styles from './BuyItemSlotsModal.module.css'

export default class BuyItemSlotsModal extends React.PureComponent<Props, State> {
  state: State = {
    slotsToBuy: undefined
  }

  handleCloseModal = (): void => {
    const { onClose } = this.props
    onClose()
  }

  hasInsufficientMana = (): boolean => {
    const { manaBalance, slotPrice } = this.props
    const { slotsToBuy } = this.state
    return slotsToBuy && slotPrice ? +slotsToBuy * slotPrice > manaBalance : false
  }

  handleItemSlotsBuy = (): void => {
    const { onBuyItemSlots, metadata } = this.props
    const { thirdParty } = metadata
    const { slotsToBuy } = this.state

    if (slotsToBuy) {
      onBuyItemSlots(thirdParty, Number(slotsToBuy))
    }
  }

  componentDidMount(): void {
    const { slotPrice, isFetchingSlotPrice, onFetchThirdPartyItemSlotPrice } = this.props

    if (!slotPrice && !isFetchingSlotPrice) {
      onFetchThirdPartyItemSlotPrice()
    }
  }

  handleSlotToBuyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      slotsToBuy: event.target.value
    })
  }

  render() {
    const { name, isBuyingItemSlots, error, isFetchingSlotPrice, slotPrice } = this.props
    const { slotsToBuy } = this.state

    const hasInsufficientMANA = this.hasInsufficientMana()

    return (
      <Modal size="tiny" onClose={this.handleCloseModal} name={name} closeIcon>
        <ModalHeader className={styles.header}>{t('buy_item_slots_modal.title')}</ModalHeader>
        <ModalDescription className={styles.description}>
          <span>{t('buy_item_slots_modal.description_line_one')}</span>
          <br />
          <span>{t('buy_item_slots_modal.description_line_two')}</span>
        </ModalDescription>
        <Modal.Content className={styles.content}>
          <div className={styles.slotsPriceContainer}>
            {isFetchingSlotPrice ? (
              <Loader active size="tiny" />
            ) : (
              <>
                <Field
                  label={t('buy_item_slots_modal.how_many_slots_title')}
                  message={t('buy_item_slots_modal.slots_value', {
                    symbol: <Mana network={Network.MATIC} size="small" />,
                    slot_cost: slotPrice
                  })}
                  placeholder="1"
                  onChange={this.handleSlotToBuyChange}
                />
                <div className={styles.slotsTotalPrice}>
                  <Mana network={Network.MATIC} inline />
                  {slotPrice && slotsToBuy ? slotPrice * +slotsToBuy : 0}
                </div>
              </>
            )}
          </div>
          {error !== null && <Message error size="tiny" visible content={error} header={t('global.error_ocurred')} />}
          {!isFetchingSlotPrice && hasInsufficientMANA && (
            <div className={styles.notEnoughMana}>
              <small>
                <T
                  id="buy_item_slots_modal.not_enough_mana"
                  values={{
                    symbol: (
                      <span>
                        <Mana className={styles.manaLogo} network={Network.MATIC} inline /> MANA
                      </span>
                    )
                  }}
                />
                <br />
                <T
                  id="buy_item_slots_modal.get_mana"
                  values={{
                    link: (
                      <a href={env.get('REACT_APP_ACCOUNT_URL', '')} rel="noopener noreferrer" target="_blank">
                        Account
                      </a>
                    )
                  }}
                />
              </small>
            </div>
          )}
        </Modal.Content>
        <div className={styles.modalActions}>
          <NetworkButton
            className={styles.acceptButton}
            primary
            disabled={hasInsufficientMANA || isBuyingItemSlots || slotsToBuy === undefined}
            loading={isBuyingItemSlots}
            network={Network.MATIC}
            onClick={this.handleItemSlotsBuy}
          >
            {t('buy_item_slots_modal.buy_slots')}
          </NetworkButton>
          <Button secondary className={styles.cancelButton} onClick={this.handleCloseModal}>
            {t('global.cancel')}
          </Button>
        </div>
      </Modal>
    )
  }
}
