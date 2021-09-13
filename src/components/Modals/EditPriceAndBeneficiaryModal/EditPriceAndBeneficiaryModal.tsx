import * as React from 'react'
import { Address } from 'web3x/address'
import { fromWei, toWei } from 'web3x/utils'
import { Network } from '@dcl/schemas'
import { ModalNavigation, ModalContent, ModalActions, Form, Field, Button, InputOnChangeData, FieldProps, Mana } from 'decentraland-ui'
import { ChainButton } from 'decentraland-dapps/dist/containers'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Info from 'components/Info'
import { isValid } from 'lib/address'
import { Item } from 'modules/item/types'
import { Props, State } from './EditPriceAndBeneficiaryModal.types'
import './EditPriceAndBeneficiaryModal.css'

export default class EditPriceAndBeneficiaryModal extends React.PureComponent<Props, State> {
  state: State = {
    isFree: false
  }

  constructor(props: Props) {
    super(props)

    const { item } = this.props
    if (item) {
      this.state = {
        ...this.state,
        price: this.getItemPrice(),
        beneficiary: item.beneficiary || item.owner
      }
    }
  }

  handleIsFreeToggle = () => {
    const isFree = !this.state.isFree
    const beneficiary = isFree ? Address.ZERO.toString() : undefined
    const price = isFree ? '0' : undefined
    this.setState({ isFree, price, beneficiary })
  }

  handleIsGiftToggle = () => {
    const { item } = this.props
    const beneficiary = this.isGift() ? item.owner : undefined
    const price = this.getItemPrice()
    this.setState({ beneficiary, price, isFree: false })
  }

  handlePriceChange = (_event: React.ChangeEvent<HTMLInputElement>, props: InputOnChangeData) => {
    this.setState({ price: props.value })
  }

  handleBeneficiaryChange = (_event: React.ChangeEvent<HTMLInputElement>, props: InputOnChangeData) => {
    const beneficiary = props.value
    this.setState({ beneficiary })
  }

  handleSubmit = () => {
    const { item, onSave, onSavePublished } = this.props
    const { price, beneficiary } = this.state

    const newItem: Item = {
      ...item!,
      price: toWei(price!, 'ether'),
      beneficiary
    }

    if (item!.isPublished) {
      onSavePublished(newItem, {})
    } else {
      onSave(newItem, {})
    }
  }

  getItemPrice() {
    const { item } = this.props
    return item.price ? fromWei(item.price, 'ether') : undefined
  }

  isDisabled() {
    const { isLoading } = this.props
    return !this.isValidPrice() || !this.isValidBeneficiary() || isLoading
  }

  isGift() {
    const { item } = this.props
    const { beneficiary } = this.state
    return beneficiary !== item.owner
  }

  isValidPrice() {
    const { price, beneficiary } = this.state
    const numberPrice = Number(price)
    return Number(numberPrice) > 0 || (numberPrice === 0 && beneficiary === Address.ZERO.toString())
  }

  isValidBeneficiary() {
    const { beneficiary = '' } = this.state
    return isValid(beneficiary)
  }

  render() {
    const { name, item, isLoading, onClose } = this.props
    const { isFree, price = '', beneficiary = '' } = this.state
    const isGift = this.isGift()

    return (
      <Modal name={name} size="tiny" onClose={onClose}>
        <ModalNavigation
          title={t('edit_price_and_beneficiary_modal.title', { name: item.name })}
          subtitle={
            <div className="actions">
              <Button size="mini" onClick={this.handleIsGiftToggle} active={!isGift}>
                {t('edit_price_and_beneficiary_modal.for_me')}
              </Button>
              <Button size="mini" onClick={this.handleIsFreeToggle} active={isFree}>
                {t('edit_price_and_beneficiary_modal.free')}
              </Button>
            </div>
          }
          onClose={onClose}
        />

        <Form onSubmit={this.handleSubmit}>
          <ModalContent>
            <div className="price-field">
              <Field
                label={t('edit_price_and_beneficiary_modal.price_label')}
                placeholder={100}
                value={price}
                onChange={this.handlePriceChange}
                disabled={isFree}
                error={!!price && !this.isValidPrice()}
              />
              <Mana network={Network.MATIC} inline />
            </div>
            <Field
              label={
                (
                  <>
                    {t('edit_price_and_beneficiary_modal.beneficiary_label')}
                    <Info content={t('edit_price_and_beneficiary_modal.beneficiary_popup')} />
                  </>
                ) as FieldProps['label']
              }
              type="address"
              placeholder="0x..."
              value={beneficiary}
              disabled={isFree}
              onChange={this.handleBeneficiaryChange}
              error={!!beneficiary && !this.isValidBeneficiary()}
            />
          </ModalContent>
          <ModalActions>
            <ChainButton primary disabled={this.isDisabled()} loading={isLoading} chainId={getChainIdByNetwork(Network.MATIC)}>
              {t('global.submit')}
            </ChainButton>
          </ModalActions>
        </Form>
      </Modal>
    )
  }
}
