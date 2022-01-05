import * as React from 'react'
import BN from 'bn.js'
import { env } from 'decentraland-commons'
import { fromWei } from 'web3x/utils'
import { Network } from '@dcl/schemas'
import { Button, ModalDescription, ModalHeader, CheckboxProps, Radio, Mana, Loader, Message } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Modal, NetworkButton } from 'decentraland-dapps/dist/containers'
import { ThirdPartyItemTier } from 'modules/tiers/types'
import { sortTiers } from 'modules/tiers/utils'
import { Props, State } from './BuyItemSlotsModal.types'
import styles from './BuyItemSlotsModal.module.css'

export default class BuyItemSlotsModal extends React.PureComponent<Props, State> {
  state = {
    selectedTierId: undefined
  }

  handleCloseModal = (): void => {
    const { onClose, onBeforeClose } = this.props
    onBeforeClose()
    onClose()
  }

  handleTierChange = (_: React.FormEvent<HTMLInputElement>, data: CheckboxProps): void => {
    const { onTierSelected } = this.props

    this.setState({ selectedTierId: data.value as string })
    onTierSelected()
  }

  getSelectedTier = (): ThirdPartyItemTier | undefined => {
    const { tiers } = this.props
    const { selectedTierId } = this.state

    return tiers && selectedTierId ? tiers.find(tier => tier.id === selectedTierId) : undefined
  }

  hasInsufficientMana = (): boolean => {
    const { manaBalance } = this.props
    const selectedTier = this.getSelectedTier()
    return selectedTier ? fromWei(new BN(selectedTier.price), 'ether').gt(new BN(manaBalance)) : false
  }

  handleItemSlotsBuy = (): void => {
    const { onBuyItemSlots, metadata } = this.props
    const { thirdParty } = metadata

    const selectedTier = this.getSelectedTier()

    if (selectedTier) {
      onBuyItemSlots(thirdParty, selectedTier as ThirdPartyItemTier)
    }
  }

  componentDidMount(): void {
    const { tiers, isFetchingTiers, onFetchThirdPartyItemSlots } = this.props

    if (tiers && tiers.length === 0 && !isFetchingTiers) {
      onFetchThirdPartyItemSlots()
    }
  }

  render() {
    const { isFetchingTiers, name, isBuyingItemSlots, tiers, error } = this.props
    const { selectedTierId } = this.state

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
          {(isFetchingTiers || tiers === undefined) && (
            <div className={styles.loader}>
              <Loader active size="large" />
            </div>
          )}
          <div>
            {tiers.sort(sortTiers).map(tier => (
              <div className={styles.tier} key={tier.id}>
                <div className={styles.tierType}>
                  <Radio
                    name="tier-radio"
                    disabled={isBuyingItemSlots}
                    value={tier.id}
                    checked={tier.id === selectedTierId}
                    onChange={this.handleTierChange}
                  />
                  <span>{t('buy_item_slots_modal.tier_value', { value: Number(tier.value).toLocaleString() })}</span>
                </div>
                <div className={styles.tierValue}>
                  <Mana network={Network.MATIC} inline /> {Number(fromWei(tier.price, 'ether')).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          {error !== null && <Message error size="tiny" visible content={error} header={t('global.error_ocurred')} />}
          {hasInsufficientMANA && (
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
            disabled={hasInsufficientMANA || isBuyingItemSlots || selectedTierId === undefined}
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
