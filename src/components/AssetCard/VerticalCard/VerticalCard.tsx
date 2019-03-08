import * as React from 'react'
import { Popup } from 'decentraland-ui'

import { GROUND_CATEGORY } from 'modules/asset/types'
import { Props } from './VerticalCard.types'
import './VerticalCard.css'

export default class VerticalCard extends React.PureComponent<Props> {
  render() {
    const { asset, isDragging } = this.props
    const { thumbnail, name } = asset

    let classes = 'AssetCard vertical'
    if (isDragging) {
      classes += ' is-dragging'
    }
    if (asset.category === GROUND_CATEGORY) {
      classes += ' ground'
    }

    return (
      <Popup
        content={name}
        position="top center"
        trigger={
          <div className={classes}>
            <img className="thumbnail" src={thumbnail} alt="" />
          </div>
        }
        hideOnScroll={true}
        on="hover"
        inverted
      />
    )
  }
}
