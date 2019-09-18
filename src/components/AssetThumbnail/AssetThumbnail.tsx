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

  render() {
    const { asset, error, hideLabel } = this.props
    let classes = 'AssetThumbnail'

    if (error) {
      classes += ' error'
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
            {error ? <div className="error-icon" /> : <img src={asset.thumbnail} />}
            {!hideLabel && (
              <span className="title" title={asset.name}>
                {asset.name}
              </span>
            )}
            {error && <span className="error">{t('asset_pack.import.errors.invalid')}</span>}
          </div>
        }
        hideOnScroll={true}
        on="hover"
        inverted
      />
    )
  }
}
