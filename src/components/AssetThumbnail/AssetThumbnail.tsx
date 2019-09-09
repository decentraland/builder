import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props, DefaultProps } from './AssetThumbnail.types'
import Icon from 'components/Icon'

import './AssetThumbnail.css'
import { CategoryName } from 'modules/ui/sidebar/utils'

export default class AssetThumbnail extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    error: false
  }

  handleRemove = () => {
    const { asset } = this.props
    this.props.onRemove(asset.id)
  }

  render() {
    const { asset, error } = this.props
    let classes = 'AssetThumbnail'

    if (error) {
      classes += ' error'
    }

    if (asset && asset.category === CategoryName.GROUND_CATEGORY) {
      classes += ' ground'
    }

    return (
      <div className={classes} key={asset.id}>
        <div className="close-button" onClick={this.handleRemove}>
          <Icon name="close" />
        </div>
        {error ? <div className="error-icon" /> : <img src={asset.thumbnail} />}
        <span className="title" title={asset.name}>
          {asset.name}
        </span>
        {error && <span className="error">{t('import_modal.invalid_file')}</span>}
      </div>
    )
  }
}
