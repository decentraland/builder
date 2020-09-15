import * as React from 'react'
import { Row, Column, Form, Field, Section, InputOnChangeData } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { isValid } from 'lib/address'
import ItemImage from 'components/ItemCard/ItemImage'
import { RARITY_MAX_SUPPLY } from 'modules/item/types'
import { Props, State, Holder } from './MinteableItem.types'
import './MinteableItem.css'

export default class MinteableItem extends React.PureComponent<Props, State> {
  state: State = {
    holders: [this.buildEmptyHolder()]
  }

  buildEmptyHolder(): Holder {
    return {
      address: undefined,
      amount: undefined
    }
  }

  handleAddNewHolder = () => {
    const holders = [...this.state.holders, this.buildEmptyHolder()]
    this.setState({ holders })
  }

  handleMint = () => {
    console.log('Mint')
  }

  getChangeAddressHandler(index: number) {
    return (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      const { holders } = this.state
      const holder = holders[index]

      holder.address = data.value ? data.value : undefined
      this.setState({ holders })
    }
  }

  getChangeAmountHandler(index: number) {
    return (_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
      const { holders } = this.state
      const holder = holders[index]

      holder.amount = data.value ? Number(data.value) : undefined
      this.setState({ holders })
    }
  }

  isValidAddress(address?: string) {
    return address === undefined || isValid(address)
  }

  isValidAmount(amount?: string) {
    return amount === undefined || !isNaN(Number(amount))
  }

  render() {
    const { item } = this.props
    const { holders } = this.state

    return (
      <div className="MinteableItem">
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
                {t('item.supply')} {item.totalSupply}/{RARITY_MAX_SUPPLY[item.rarity!]}
              </span>
              <div className="link" onClick={this.handleAddNewHolder}>
                +
              </div>
            </div>
          </Column>
        </Row>
        <Form onSubmit={this.handleMint}>
          {holders.map(({ address, amount }, index) => (
            <Section key={index} className="holder" size="tiny">
              <Field
                className="rounded"
                type="address"
                placeholder={t('global.address')}
                value={address}
                message={undefined}
                onChange={this.getChangeAddressHandler(index)}
              />
              <Field
                className="rounded"
                type="number"
                placeholder={t('item.supply')}
                value={amount}
                message={undefined}
                onChange={this.getChangeAmountHandler(index)}
              />
            </Section>
          ))}
        </Form>
      </div>
    )
  }
}
