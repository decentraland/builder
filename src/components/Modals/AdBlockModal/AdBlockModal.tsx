import * as React from 'react'
import { Close, Button } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import { Campaign } from 'modules/analytics/campaigns'

import { Props } from './AdBlockModal.types'

import './AdBlockModal.css'

export default class AdBlockModal extends React.PureComponent<Props> {
  handleClick = () => {
    const { metadata } = this.props
    if (metadata) {
      const analytics = getAnalytics()
      analytics.track(this.props.metadata.origin, {
        campaign: Campaign.DAPPER
      })
    }
    window.open('https://dap.pr/dclinstallp')
  }

  render() {
    const { name, onClose } = this.props

    return (
      <Modal name={name} closeIcon={<Close onClick={onClose} />}>
        <Modal.Header>{t('adblock_modal.title')}</Modal.Header>
        <Modal.Content>{t('adblock_modal.body')}</Modal.Content>
        <Modal.Actions>
          <Button primary onClick={this.handleClick}>
            Continue
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
