import * as React from 'react'

import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props } from './DeployButton.types'
import './DeployButton.css'

export default class DeployButton extends React.PureComponent<Props> {
  static defaultProps: Props = {
    isDisabled: false,
    onClick: () => {
      /* noop */
    }
  }

  render() {
    const { isDisabled, onClick } = this.props
    return (
      <Button primary className="DeployButton" size="mini" onClick={onClick} disabled={isDisabled}>
        {t('topbar.publish')}
      </Button>
    )
  }
}
