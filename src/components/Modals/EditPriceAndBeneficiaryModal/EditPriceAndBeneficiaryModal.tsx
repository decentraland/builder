import * as React from 'react'
import { ModalNavigation, ModalContent, ModalActions, Form, Field, Button, InputOnChangeData } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { fromWei, toWei } from 'web3x-es/utils'

import { isValid } from 'lib/address'
import { addSymbol } from 'lib/mana'
import { Item } from 'modules/item/types'
import { Props, State } from './EditPriceAndBeneficiaryModal.types'

export default class EditPriceAndBeneficiaryModal extends React.PureComponent<Props, State> {
  state: State = {}

  constructor(props: Props) {
    super(props)

    const { item } = this.props
    if (item) {
      this.state = {
        price: item.price ? fromWei(item.price, 'ether') : undefined,
        beneficiary: item.beneficiary
      }
    }
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
      onSavePublished(newItem)
    } else {
      onSave(newItem, {})
    }
  }

  isDisabled() {
    const { isLoading } = this.props
    return !this.isValidPrice() || !this.isValidBeneficiary() || isLoading
  }

  isValidPrice() {
    const { price } = this.state
    return !price || Number(price) >= 0
  }

  isValidBeneficiary() {
    const { beneficiary } = this.state
    return !beneficiary || isValid(beneficiary)
  }

  render() {
    const { name, item, isLoading, onClose } = this.props
    const { price = '', beneficiary = '' } = this.state

    return (
      <Modal name={name} size="tiny" onClose={onClose}>
        <ModalNavigation title={t('edit_price_and_beneficiary_modal.title', { name: item ? item.name : '...' })} onClose={onClose} />
        <Form onSubmit={this.handleSubmit}>
          <ModalContent>
            <Field
              label={t('edit_price_and_beneficiary_modal.price_label')}
              placeholder={addSymbol(100)}
              value={price}
              onChange={this.handlePriceChange}
              error={!this.isValidPrice()}
            />
            <Field
              label={t('edit_price_and_beneficiary_modal.beneficiary_label')}
              type="address"
              placeholder="0x..."
              value={beneficiary}
              onChange={this.handleBeneficiaryChange}
              error={!this.isValidBeneficiary()}
            />
          </ModalContent>
          <ModalActions>
            <Button primary disabled={this.isDisabled()} loading={isLoading} onClick={this.handleSubmit}>
              {t('global.submit')}
            </Button>
          </ModalActions>
        </Form>
      </Modal>
    )
  }
}
