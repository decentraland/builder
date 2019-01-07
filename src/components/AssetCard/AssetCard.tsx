import * as React from 'react'
import { Props } from './AssetCard.types'
import VerticalCard from './VerticalCard'
import HorizontalCard from './HorizontalCard'

export default class AssetCard extends React.PureComponent<Props> {
  render() {
    const { isHorizontal, asset } = this.props

    return isHorizontal ? <HorizontalCard asset={asset} /> : <VerticalCard asset={asset} />
  }
}
