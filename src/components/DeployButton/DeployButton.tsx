import * as React from 'react'

import { Button, Dropdown } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { preventDefault } from 'lib/preventDefault'

import { Props, DefaultProps } from './DeployButton.types'
import './DeployButton.css'
import { DeploymentStatus } from 'modules/deployment/types'

export default class DeployButton extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    isDisabled: false,
    onClick: () => {
      /* noop */
    }
  }

  handleClearDeployment = () => {
    this.props.onOpenModal('DeployModal', {
      intent: 'clear_deployment'
    })
  }

  render() {
    const { isDisabled, deploymentStatus, onClick } = this.props
    const disabled = isDisabled || deploymentStatus === DeploymentStatus.PUBLISHED
    const canUpdate = deploymentStatus === DeploymentStatus.NEEDS_SYNC

    return (
      <>
        <Button primary className="DeployButton" size="mini" onClick={onClick} disabled={disabled}>
          {canUpdate ? 'Update Scene' : t('topbar.publish')}
        </Button>
        <Dropdown direction="left" onClick={preventDefault()}>
          <Dropdown.Menu>
            <Dropdown.Item text="Unpublish" onClick={this.handleClearDeployment} />
          </Dropdown.Menu>
        </Dropdown>
      </>
    )
  }
}
