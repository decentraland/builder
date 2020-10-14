import * as React from 'react'
import { Row, Column, Field, Section, InputOnChangeData } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { isValid } from 'lib/address'
import ItemImage from 'components/ItemImage'
import Icon from 'components/Icon'
import { getMaxSupply } from 'modules/item/utils'
import { Props } from './MintableItem.types'
import './MintableItem.css'

export default class MintableItem extends React.PureComponent<Props> {
  handleAddNewMint = () => {
    const { item, mints, onChange } = this.props
    onChange(item, [...mints, { item }])
  }

  getChangeAddressHandler(index: number) {
    const { item, mints, onChange } = this.props
    return (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      const mint = {
        ...mints[index],
        address: data.value ? data.value : undefined
      }
      const newMints = [...mints.slice(0, index), mint, ...mints.slice(index + 1)]
      onChange(item, newMints)
    }
  }

  getChangeAmountHandler(index: number) {
    const { item, mints, onChange } = this.props
    return (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      const mint = {
        ...mints[index],
        amount: data.value ? Number(data.value) : undefined
      }
      const newMints = [...mints.slice(0, index), mint, ...mints.slice(index + 1)]

      const currentSupply = this.getSupply(newMints)
      if (this.isValidSupply(currentSupply)) {
        onChange(item, newMints)
      }
    }
  }

  getRemoveMintHandler(index: number) {
    const { item, mints, onChange } = this.props
    return () => {
      if (mints.length > 1) {
        onChange(item, [...mints.slice(0, index), ...mints.slice(index + 1)])
      }
    }
  }

  isValidAddress(address?: string) {
    return address === undefined || isValid(address)
  }

  isValidAmount(amount?: number) {
    return amount === undefined || amount >= 0
  }

  isValidSupply(supply: number) {
    const { item } = this.props
    return supply >= 0 && supply <= getMaxSupply(item)
  }

  getSupply(mints: Props['mints']) {
    const { item } = this.props
    const totalSupply = item.totalSupply || 0
    let currentSupply = 0
    for (const mint of mints) {
      currentSupply += mint.amount || 0
    }
    return totalSupply + currentSupply
  }

  render() {
    const { item, mints } = this.props

    return (
      <div className="MintableItem">
        <Row>
          <Column grow={true}>
            <div className="item-header">
              <ItemImage item={item} />
              <span>{item.name}</span>
            </div>
          </Column>

          <Column align="right">
            <div className="item-header">
              <span className="stock">
                {t('item.supply')} {this.getSupply(mints)}/{getMaxSupply(item)}
              </span>
              <Icon name="plus" className="remove-item" onClick={this.handleAddNewMint} />
            </div>
          </Column>
        </Row>
        {mints.map(({ address, amount }, index) => (
          <Section key={index} className="mint" size="tiny">
            <Field
              className="rounded"
              type="address"
              placeholder={t('global.address')}
              value={address || ''}
              message={undefined}
              error={!this.isValidAddress(address)}
              onChange={this.getChangeAddressHandler(index)}
            />
            <Field
              className="rounded"
              type="number"
              placeholder={t('global.amount')}
              value={amount || ''}
              message={undefined}
              error={!this.isValidAmount(amount)}
              onChange={this.getChangeAmountHandler(index)}
            />
            <Icon name="minus" className="remove-item" onClick={this.getRemoveMintHandler(index)} />
          </Section>
        ))}
      </div>
    )
  }
}
