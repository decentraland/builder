import * as React from 'react'
import { Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { CategoryName } from 'modules/ui/sidebar/utils'
import Icon from 'components/Icon'

import { Props } from './AssetThumbnail.types'
import './AssetThumbnail.css'

export default class AssetThumbnail extends React.PureComponent<Props> {
  handleRemove = () => {
    const { asset } = this.props
    this.props.onRemove(asset.id)
  }

  handleClick = () => {
    const { asset, onClick } = this.props
    if (onClick) {
      onClick(asset)
    }
  }

  render() {
    const { asset, error, errorLabel, hideLabel, onClick } = this.props
    let classes = 'AssetThumbnail'

    if (error) {
      classes += ' error'
    }

    if (onClick) {
      classes += ' clickable'
    }

    if (asset && asset.category === CategoryName.GROUND_CATEGORY) {
      classes += ' ground'
    }

    return (
      <Popup
        className="modal-tooltip"
        content={error}
        disabled={!error}
        position="top center"
        trigger={
          <div className={classes} key={asset.id}>
            <div className="close-button" onClick={this.handleRemove}>
              <Icon name="close" />
            </div>
            <div className="wrapper" onClick={this.handleClick}>
              {!asset || !asset.thumbnail ? <div className="error-icon" /> : <img src={asset.thumbnail} />}
              {!hideLabel && (
                <span className="title" title={asset.name}>
                  {asset.name}
                </span>
              )}
              {error && !hideLabel && <span className="error">{errorLabel || t('asset_pack.import.errors.invalid')}</span>}
            </div>
          </div>
        }
        hideOnScroll={true}
        on="hover"
        inverted
        basic
      />
    )
  }
}
