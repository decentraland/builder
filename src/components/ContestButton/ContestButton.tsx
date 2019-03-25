import * as React from 'react'

import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props } from './ContestButton.types'
import './ContestButton.css'

export default class ContestButton extends React.PureComponent<Props> {
  static defaultProps: Props = {
    shouldUpdateEntry: false,
    isDisabled: false,
    onClick: () => {
      /* noop */
    }
  }

  render() {
    const { isDisabled, shouldUpdateEntry, onClick } = this.props
    return (
      <Button primary className="ContestButton" size="mini" onClick={onClick} disabled={isDisabled}>
        {shouldUpdateEntry ? t('contest.update_text') : t('contest.submit_text')}
      </Button>
    )
  }
}
