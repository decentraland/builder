import * as React from 'react'
import { ethers } from 'ethers'
import { Network } from '@dcl/schemas'
import { config } from 'config'
import {
  ModalNavigation,
  ModalContent,
  ModalActions,
  Form,
  Field,
  Button,
  InputOnChangeData,
  FieldProps,
  Mana,
  Card,
  Checkbox
} from 'decentraland-ui'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { toFixedMANAValue } from 'decentraland-dapps/dist/lib/mana'
import ItemImage from 'components/ItemImage'
import Info from 'components/Info'
import { isValid } from 'lib/address'
import { Item, ItemType } from 'modules/item/types'
import { Props, State } from './EditPriceAndBeneficiaryModal.types'
import './EditPriceAndBeneficiaryModal.css'
import { getOneYearFromNowDate } from './utils'

const MIN_SALE_VALUE = ethers.utils.formatEther(config.get('MIN_SALE_VALUE_IN_WEI', '0'))

export default class EditPriceAndBeneficiaryModal extends React.PureComponent<Props, State> {
  state: State = {
    isFree: false,
    isOwnerBeneficiary: false
  }

  constructor(props: Props) {
    super(props)

    const { item } = this.props
    if (item) {
      const isFree = item.beneficiary === ethers.constants.AddressZero
      this.state = {
        isFree,
        price: this.getItemPrice(),
        beneficiary: isFree ? '' : item.beneficiary || item.owner,
        isOwnerBeneficiary: item.beneficiary === item.owner,
        expirationDate: getOneYearFromNowDate()
      }
    }
  }

  handleIsFreeToggle = (_event: React.MouseEvent<HTMLInputElement>) => {
    const isFree = !this.state.isFree
    this.setState({ isFree, isOwnerBeneficiary: isFree ? false : this.state.isOwnerBeneficiary })
  }

  handleIsOwnerBeneficiary = (_event: React.MouseEvent<HTMLInputElement>) => {
    if (this.state.isFree) {
      _event.preventDefault()
      return
    }
    this.setState({ isOwnerBeneficiary: !this.state.isOwnerBeneficiary })
  }

  handlePriceChange = (_event: React.ChangeEvent<HTMLInputElement>, props: InputOnChangeData) => {
    this.setState({ price: toFixedMANAValue(props.value) })
  }

  handleBeneficiaryChange = (_event: React.ChangeEvent<HTMLInputElement>, props: InputOnChangeData) => {
    const beneficiary = props.value
    this.setState({ beneficiary })
  }

  handleExpirationDateChange = (_event: React.ChangeEvent<HTMLInputElement>, props: InputOnChangeData) => {
    const expirationDate = props.value
    this.setState({ expirationDate })
  }

  handleSubmit = () => {
    const { item, itemSortedContents, onSave, onSetPriceAndBeneficiary } = this.props
    const { price, isFree, expirationDate } = this.state
    const priceInWei = ethers.utils.parseEther(isFree ? '0' : price!).toString()
    const beneficiary = this.getBeneficiary()
    const expiresAt = expirationDate ? new Date(expirationDate) : undefined

    if (item.isPublished) {
      onSetPriceAndBeneficiary(item.id, priceInWei, beneficiary, expiresAt)
    } else {
      const newItem: Item<ItemType.WEARABLE | ItemType.EMOTE> = {
        ...item,
        price: priceInWei,
        beneficiary
      }
      // Send itemSortedContents if this modal was opened from CreateSingleItem modal.
      onSave(newItem as Item, itemSortedContents ?? {})
    }
  }

  getBeneficiary() {
    const { item } = this.props
    const { beneficiary, isFree, isOwnerBeneficiary } = this.state

    if (isFree) {
      return ethers.constants.AddressZero
    } else if (isOwnerBeneficiary) {
      return item.owner
    } else {
      return beneficiary!
    }
  }

  getItemPrice() {
    const { item, isOffchainPublicItemOrdersEnabledVariants } = this.props
    const variantWallet = isOffchainPublicItemOrdersEnabledVariants?.payload?.value?.trim()
    if (variantWallet?.toLocaleLowerCase() === item.owner?.toLocaleLowerCase()) {
      return ethers.utils.formatEther(ethers.constants.MaxUint256)
    }
    return item.price && item.price !== ethers.constants.MaxUint256.toString() ? ethers.utils.formatEther(item.price) : undefined
  }

  isDisabled() {
    const { isLoading } = this.props
    return !this.isValidPrice() || !this.isValidBeneficiary() || isLoading || !this.isValidExpirationDate()
  }

  isValidPrice() {
    const { price, isFree } = this.state
    const numberPrice = Number(price)
    return Number(numberPrice) > 0 || isFree
  }

  isPriceTooLow() {
    const { price = '' } = this.state
    return price !== '' && Number(price) < Number(MIN_SALE_VALUE)
  }

  isValidExpirationDate() {
    const { expirationDate } = this.state
    const { withExpirationDate } = this.props
    return !withExpirationDate || (expirationDate && new Date(expirationDate) >= new Date())
  }

  isValidBeneficiary() {
    return isValid(this.getBeneficiary())
  }

  render() {
    const { name, error, isLoading, mountNode, item, withExpirationDate, isOffchain, onClose, onSkip } = this.props
    const { isFree, isOwnerBeneficiary, price = '', expirationDate } = this.state
    const beneficiary = this.getBeneficiary()

    const expirationError = !this.isValidExpirationDate() ? t('edit_price_and_beneficiary_modal.expiration_date_error') : null
    const errorMessage = error || expirationError
    return (
      <Modal name={name} size="small" onClose={onClose} mountNode={mountNode}>
        <ModalNavigation title={t('edit_price_and_beneficiary_modal.title')} onClose={onClose} />
        <div className="modalContainer">
          <div className="priceThumbnail">
            <ItemImage className="priceImage" item={item as any} />
            <span className="priceName">{item.name}</span>
          </div>
          <Form onSubmit={this.handleSubmit}>
            <ModalContent>
              <div className="price-field">
                <Field
                  label={t('edit_price_and_beneficiary_modal.price_label', { minPrice: MIN_SALE_VALUE })}
                  placeholder={100}
                  value={isFree ? 0 : price}
                  onChange={this.handlePriceChange}
                  disabled={isFree}
                  error={!!price && !this.isValidPrice()}
                />
                <Mana showTooltip network={Network.MATIC} inline />
                <div className="checkbox make-it-free">
                  <Checkbox className="item-checkbox" checked={isFree} onClick={this.handleIsFreeToggle} />
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
                disabled={isFree || isOwnerBeneficiary}
                onChange={this.handleBeneficiaryChange}
                error={!!beneficiary && !this.isValidBeneficiary()}
              />
              <div className="checkbox beneficiary">
                <Checkbox
                  className="item-checkbox"
                  disabled={isFree}
                  checked={isOwnerBeneficiary}
                  onClick={this.handleIsOwnerBeneficiary}
                  label={t('edit_price_and_beneficiary_modal.for_me')}
                />
              </div>
              {withExpirationDate ? (
                <Field
                  label={t('edit_price_and_beneficiary_modal.expiration_date_label')}
                  type="date"
                  onChange={this.handleExpirationDateChange}
                  value={expirationDate}
                />
              ) : null}
              {this.isPriceTooLow() || isFree ? (
                <Card fluid className="min-price-notice">
                  <Card.Content>
                    <div>
                      {this.isPriceTooLow() ? (
                        <T
                          id="edit_price_and_beneficiary_modal.price_message"
                          values={{
                            minPrice: (
                              <Mana showTooltip inline network={Network.MATIC}>
                                {MIN_SALE_VALUE}
                              </Mana>
                            ),
                            token: t(`tokens.${Network.MATIC.toLowerCase()}`),
                            br: <br />
                          }}
                        />
                      ) : isFree ? (
                        t('edit_price_and_beneficiary_modal.free_message')
                      ) : null}
                    </div>
                  </Card.Content>
                </Card>
              ) : null}
              {errorMessage ? <p className="danger-text">{errorMessage}</p> : null}
            </ModalContent>
            <ModalActions>
              {onSkip ? (
                <Button secondary disabled={isLoading} onClick={onSkip} type="button">
                  {t('global.skip')}
                </Button>
              ) : (
                <Button secondary disabled={isLoading} onClick={onClose} type="button">
                  {t('edit_price_and_beneficiary_modal.cancel')}
                </Button>
              )}
              <NetworkButton primary disabled={this.isDisabled()} loading={isLoading} network={Network.MATIC}>
                {t(isOffchain ? 'collection_detail_page.put_for_sale' : 'global.save')}
              </NetworkButton>
            </ModalActions>
          </Form>
        </div>
      </Modal>
    )
  }
}
