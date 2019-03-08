import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Icon from 'components/Icon'
import { Props, DefaultProps } from './ClosePopup.types'

import './ClosePopup.css'

export default class ClosePopup extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    onClick: (_: React.MouseEvent<HTMLElement>) => {
      /* noop */
    }
  }

  render() {
    const { onClick } = this.props

    return (
      <div className="ClosePopup">
        {t('close_popup.shortcuts_help')}
        <Icon name="erase" onClick={onClick} />
      </div>
    )
  }
}
