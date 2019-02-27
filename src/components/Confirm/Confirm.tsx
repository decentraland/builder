import * as React from 'react'
import { Button, Confirm as ConfirmModal, ConfirmProps } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import './Confirm.css'

export default class Confirm extends React.PureComponent<ConfirmProps> {
  render() {
    return (
      <ConfirmModal
        className="confirm"
        size="tiny"
        confirmButton={<Button primary>{t('global.confirm')}</Button>}
        cancelButton={<Button secondary>{t('global.cancel')}</Button>}
        {...this.props}
      />
    )
  }
}
