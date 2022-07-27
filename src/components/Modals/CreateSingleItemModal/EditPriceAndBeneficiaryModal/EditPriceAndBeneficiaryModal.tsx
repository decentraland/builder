import * as React from 'react'
import { ethers } from 'ethers'
import { Network } from '@dcl/schemas'
import { config } from 'config'
import {
  ModalNavigation,
  ModalContent,
  Form,
  Field,
  Button,
  InputOnChangeData,
  FieldProps,
  Mana,
  Card,
  Row,
  Checkbox
} from 'decentraland-ui'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { toFixedMANAValue } from 'decentraland-dapps/dist/lib/mana'

import Info from 'components/Info'
import { isValid } from 'lib/address'
import { Item } from 'modules/item/types'
import { Props, State } from './EditPriceAndBeneficiaryModal.types'
import './EditPriceAndBeneficiaryModal.css'

const MIN_SALE_VALUE = ethers.utils.formatEther(config.get('MIN_SALE_VALUE_IN_WEI', '0'))

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
    const beneficiary = isFree ? ethers.constants.AddressZero : undefined
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
    this.setState({ price: toFixedMANAValue(props.value) })
  }

  handleBeneficiaryChange = (_event: React.ChangeEvent<HTMLInputElement>, props: InputOnChangeData) => {
    const beneficiary = props.value
    this.setState({ beneficiary })
  }

  handleSubmit = () => {
    const { item, onSave } = this.props
    const { price, beneficiary } = this.state
    const priceInWei = ethers.utils.parseEther(price!).toString()

    const newItem: Item = {
      ...item!,
      price: priceInWei,
      beneficiary
    }
    onSave(newItem, {})
  }

  getItemPrice() {
    const { item } = this.props
    return item.price ? ethers.utils.formatEther(item.price) : undefined
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
    return Number(numberPrice) > 0 || (numberPrice === 0 && beneficiary === ethers.constants.AddressZero)
  }

  isPriceTooLow() {
    const { price = '' } = this.state
    return price !== '' && price < MIN_SALE_VALUE
  }

  isValidBeneficiary() {
    const { beneficiary = '' } = this.state
    return isValid(beneficiary)
  }

  render() {
    const { title, isLoading, onClose, onSkip } = this.props
    const { isFree, price = '', beneficiary = '' } = this.state

    const isGift = this.isGift()

    return (
      <>
        <ModalNavigation title={title} onClose={onClose} />

        <Form onSubmit={this.handleSubmit}>
          <ModalContent>
            <div className="price-field">
              <Field
                label={t('edit_price_and_beneficiary_modal.price_label', { minPrice: MIN_SALE_VALUE })}
                placeholder={100}
                value={price}
                onChange={this.handlePriceChange}
                disabled={isFree}
                error={!!price && !this.isValidPrice()}
              />
              <Mana network={Network.MATIC} inline />
              <div className="checkbox make-it-free">
                <Checkbox
                  className="item-checkbox"
                  checked={isFree}
                  onClick={(_event: React.MouseEvent<HTMLInputElement>) => this.handleIsFreeToggle()}
                />
                &nbsp;
                {t('edit_price_and_beneficiary_modal.free')}
              </div>
            </div>
            <Field
              label={
                (
                  <>
                    {t('edit_price_and_beneficiary_modal.beneficiary_label')}
                    <Info content={t('edit_price_and_beneficiary_modal.beneficiary_popup')} className="info" />
                  </>
                ) as FieldProps['label']
              }
              type="address"
              placeholder="0x..."
              value={beneficiary}
              disabled={isFree}
              readOnly={!isGift}
              onChange={this.handleBeneficiaryChange}
              error={!!beneficiary && !this.isValidBeneficiary()}
            />
            <div className="checkbox beneficiary">
              <Checkbox
                className="item-checkbox"
                checked={!isGift}
                onClick={(_event: React.MouseEvent<HTMLInputElement>) => this.handleIsGiftToggle()}
              />
              &nbsp;
              {t('edit_price_and_beneficiary_modal.for_me')}
            </div>
            {this.isPriceTooLow() ? (
              <Card fluid className="min-price-notice">
                <Card.Content>
                  <div>
                    <T
                      id="edit_price_and_beneficiary_modal.price_message"
                      values={{
                        minPrice: (
                          <Mana inline network={Network.MATIC}>
                            {MIN_SALE_VALUE}
                          </Mana>
                        ),
                        token: t(`tokens.${Network.MATIC.toLowerCase()}`),
                        br: <br />
                      }}
                    />
                  </div>
                </Card.Content>
              </Card>
            ) : null}
            <Row className="actions" align="right">
              <Button loading={isLoading} onClick={onSkip} type="button">
                {t('global.skip')}
              </Button>
              <NetworkButton primary disabled={this.isDisabled()} loading={isLoading} network={Network.MATIC}>
                {t('global.save')}
              </NetworkButton>
            </Row>
          </ModalContent>
        </Form>
      </>
    )
  }
}
