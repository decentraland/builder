import * as React from 'react'
import { Asset } from 'modules/asset/types'
import { Props } from './AssetCard.types'
import VerticalCard from './VerticalCard'
import HorizontalCard from './HorizontalCard'

export default class AssetCard extends React.PureComponent<Props> {
  static defaultProps = {
    onClick: (_: Asset) => {
      /* noop */
    }
  }

  handleOnClick = () => {
    const { asset, onClick } = this.props
    onClick(asset)
  }

  render() {
    const { isHorizontal, asset } = this.props
    return <div onClick={this.handleOnClick}>{isHorizontal ? <HorizontalCard asset={asset} /> : <VerticalCard asset={asset} />}</div>
  }
}
