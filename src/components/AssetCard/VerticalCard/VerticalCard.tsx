import * as React from 'react'
import { Popup } from 'decentraland-ui'

import Icon from 'components/Icon'
import { GROUND_CATEGORY } from 'modules/asset/types'
import { Props } from './VerticalCard.types'
import './VerticalCard.css'

export default class VerticalCard extends React.PureComponent<Props> {
  render() {
    const { asset, isDragging } = this.props
    const { thumbnail, name } = asset
    const hasScript = !!asset.script

    let classes = 'AssetCard vertical'
    if (hasScript) {
      classes += ' smart'
    }
    if (isDragging) {
      classes += ' is-dragging'
    }
    if (asset.category === GROUND_CATEGORY) {
      classes += ' ground'
    }
    if (asset.isDisabled) {
      classes += ' disabled'
    }

    const content = (
      <div className={classes}>
        <img className="thumbnail" src={thumbnail} alt="" draggable={false} />
        {hasScript && (
          <div className="badge">
            <Icon name="smart" />
          </div>
        )}
      </div>
    )

    return name ? (
      <Popup className="asset-popup" content={name} position="top center" trigger={content} hideOnScroll={true} on="hover" inverted basic />
    ) : (
      content
    )
  }
}
