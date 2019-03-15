import * as React from 'react'

import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props } from './ContestButton.types'
import './ContestButton.css'

export default class ContestButton extends React.PureComponent<Props> {
  static defaultProps: Props = {
    updateEntry: false,
    disabled: false,
    onClick: () => {
      /* noop */
    }
  }

  render() {
    const { disabled, updateEntry, onClick } = this.props
    return (
      <Button className="ContestButton" size="mini" onClick={onClick} disabled={disabled}>
        {updateEntry ? t('contest.update_text') : t('contest.submit_text')}
      </Button>
    )
  }
}
