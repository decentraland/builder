import * as React from 'react'
import BN from 'bn.js'
import { Button, CheckboxProps, Mana, Radio } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Modal, NetworkButton } from 'decentraland-dapps/dist/containers'
import { Props, State } from './BuyItemSlotsModal.types'
import { env } from 'decentraland-commons'
import { Network } from '@dcl/schemas'

export default class BuyItemSlotsModal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { selectedTierId: undefined }
  }

  handleTierChange = (_: React.FormEvent<HTMLInputElement>, data: CheckboxProps): void => {
    this.setState({ selectedTierId: data.value as string })
  }

  render() {
    const { onClose, name, manaBalance, isBuyingItemSlots, tiers } = this.props
    const { selectedTierId } = this.state
    const selectedTier = tiers.find(tier => tier.id === selectedTierId)
    const hasInsufficientMANA = selectedTier ? new BN(selectedTier.price).gt(new BN(manaBalance)) : false

    return (
      <Modal onClose={onClose} name={name}>
        <Modal.Header>{t('buy_item_slots_modal.title')}</Modal.Header>
        <Modal.Description>{t('buy_item_slot_modal.description')}</Modal.Description>
        <Modal.Content>
          <div>
            {tiers.map(tier => (
              <div>
                <Radio
                  name="tier-radio"
                  disabled={isBuyingItemSlots}
                  value={tier.id}
                  checked={tier.id === selectedTierId}
                  onChange={this.handleTierChange}
                />
                <span>{t('buy_item_slots_modal.tier_value', { value: tier.value })}</span>
                <span>
                  <Mana network={Network.MATIC} inline /> {tier.price}
                </span>
              </div>
            ))}
          </div>
          {hasInsufficientMANA && (
            <div>
              {/* TODO: Check if this can be extracted into a component */}
              <small className="not-enough-mana-notice">
                <T
                  id="buy_item_slots_modal.not_enogh_mana"
                  values={{
                    symbol: (
                      <span>
                        <Mana network={Network.MATIC} inline /> MANA
                      </span>
                    )
                  }}
                />
                <br />
                {/* TODO: The text of buy_item_slots_modal.get_mana is repeated */}
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
        <Modal.actions>
          <NetworkButton primary disabled={hasInsufficientMANA || isBuyingItemSlots} loading={isBuyingItemSlots} network={Network.MATIC}>
            {t('buy_item_slots_modal.buy_slots')}
          </NetworkButton>
          <Button fluid>{t('global.cancel')}</Button>
        </Modal.actions>
      </Modal>
    )
  }
}
