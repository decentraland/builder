import * as React from 'react'
import BN from 'bn.js'
import { env } from 'decentraland-commons'
import { fromWei } from 'web3x/utils'
import { Network } from '@dcl/schemas'
import { Button, ModalDescription, ModalHeader, CheckboxProps, Radio, Mana, Loader, Message } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Modal, NetworkButton } from 'decentraland-dapps/dist/containers'
import { ThirdPartyItemTier } from 'modules/tiers/types'
import { Props } from './BuyItemSlotsModal.types'
import styles from './BuyItemSlotsModal.module.css'

const sortTiers = (a: ThirdPartyItemTier, b: ThirdPartyItemTier) => {
  if (a.value < b.value) {
    return -1
  } else if (a.value > b.value) {
    return 1
  }
  return 0
}

const BuyItemSlotsModal = (props: Props) => {
  const {
    onClose,
    onFetchThirdPartyItemSlots,
    onBuyItemSlots,
    isFetchingTiers,
    name,
    manaBalance,
    isBuyingItemSlots,
    tiers,
    error,
    metadata
  } = props
  const { thirdParty } = metadata
  const [selectedTierId, setSelectedTierId] = React.useState<string | undefined>(undefined)
  const handleTierChange = React.useCallback(
    (_: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => setSelectedTierId(data.value as string),
    [setSelectedTierId]
  )
  const selectedTier = React.useMemo(() => (tiers ? tiers.find(tier => tier.id === selectedTierId) : undefined), [tiers, selectedTierId])
  const handleItemSlotsBuy = React.useCallback(() => onBuyItemSlots(thirdParty, selectedTier as ThirdPartyItemTier), [
    selectedTierId,
    onBuyItemSlots
  ])
  const hasInsufficientMANA = React.useMemo(() => (selectedTier ? new BN(selectedTier.price).gt(new BN(manaBalance)) : false), [
    selectedTier,
    manaBalance
  ])
  React.useEffect(() => {
    if (tiers && tiers.length === 0 && !isFetchingTiers) {
      onFetchThirdPartyItemSlots()
    }
  }, [])

  return (
    <Modal size="tiny" onClose={onClose} name={name} closeIcon>
      <ModalHeader className={styles.header}>{t('buy_item_slots_modal.title')}</ModalHeader>
      <ModalDescription className={styles.description}>
        <span>{t('buy_item_slots_modal.description_line_one')}</span>
        <br />
        <span>{t('buy_item_slots_modal.description_line_two')}</span>
      </ModalDescription>
      <Modal.Content className={styles.content}>
        {(isFetchingTiers || tiers === undefined) && <Loader active size="large" />}
        <div>
          {tiers.sort(sortTiers).map(tier => (
            <div className={styles.tier} key={tier.id}>
              <div className={styles.tierType}>
                <Radio
                  name="tier-radio"
                  disabled={isBuyingItemSlots}
                  value={tier.id}
                  checked={tier.id === selectedTierId}
                  onChange={handleTierChange}
                />
                <span>{t('buy_item_slots_modal.tier_value', { value: Number(tier.value).toLocaleString() })}</span>
              </div>
              <div className={styles.tierValue}>
                <Mana network={Network.MATIC} inline /> {Number(fromWei(tier.price, 'ether')).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        {error && <Message error visible content={error} header={t('global.error_ocurred')} />}
        {hasInsufficientMANA && (
          <div className={styles.notEnoughMana}>
            <small>
              <T
                id="buy_item_slots_modal.not_enough_mana"
                values={{
                  symbol: (
                    <span>
                      <Mana network={Network.MATIC} inline /> MANA
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
          onClick={handleItemSlotsBuy}
        >
          {t('buy_item_slots_modal.buy_slots')}
        </NetworkButton>
        <Button secondary className={styles.cancelButton} onClick={onClose}>
          {t('global.cancel')}
        </Button>
      </div>
    </Modal>
  )
}

export default BuyItemSlotsModal
