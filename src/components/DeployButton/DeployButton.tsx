import * as React from 'react'

import { Button, Dropdown, Popup } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { preventDefault } from 'lib/preventDefault'
import { getExceededMetrics } from 'modules/scene/utils'

import { Props, DefaultProps } from './DeployButton.types'
import './DeployButton.css'
import { DeploymentStatus } from 'modules/deployment/types'

export default class DeployButton extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    onClick: () => {
      /* noop */
    }
  }

  handleClearDeployment = () => {
    this.props.onOpenModal('DeployModal', {
      intent: 'clear_deployment'
    })
  }

  getExceededMetric() {
    const { metrics, limits } = this.props
    const exceededMetrics = getExceededMetrics(metrics, limits)
    return exceededMetrics.length > 0 ? exceededMetrics[0] : ''
  }

  renderPopupContent = () => {
    const { areEntitiesOutOfBoundaries, deploymentStatus } = this.props
    const exceededMetric = this.getExceededMetric()
    if (areEntitiesOutOfBoundaries) return <T id="topbar.bounds_exceeded" values={{ br: <br /> }} />
    if (exceededMetric !== '') return <T id="topbar.limits_exceeded" values={{ metric: exceededMetric, br: <br /> }} />
    if (deploymentStatus === DeploymentStatus.PUBLISHED) {
      return (
        <span>
          Up to date!
          <br />
          All the changes are published
        </span>
      )
    }
    return null
  }

  render() {
    const { deploymentStatus, areEntitiesOutOfBoundaries, isLoading, onClick } = this.props
    const exceededMetric = this.getExceededMetric()
    const didExceedMetrics = exceededMetric !== '' || areEntitiesOutOfBoundaries
    const needsSync = deploymentStatus === DeploymentStatus.NEEDS_SYNC
    const isPublished = deploymentStatus === DeploymentStatus.PUBLISHED
    const canUpdate = needsSync || isPublished
    const isButtonDisabled = isLoading || didExceedMetrics || isPublished
    const isPopupDisabled = isLoading || !isButtonDisabled

    return (
      <span className="DeployButton">
        <Popup
          className="publish-disabled"
          content={this.renderPopupContent()}
          position="bottom center"
          disabled={isPopupDisabled}
          trigger={
            <span>
              <Button primary size="mini" onClick={onClick} disabled={isButtonDisabled}>
                {canUpdate ? 'Update Scene' : t('topbar.publish')}
              </Button>
            </span>
          }
          on="hover"
          inverted
        />
        <Dropdown direction="left" onClick={preventDefault()} disabled={!canUpdate || isLoading}>
          <Dropdown.Menu>
            <Dropdown.Item text="Unpublish" onClick={this.handleClearDeployment} />
          </Dropdown.Menu>
        </Dropdown>
      </span>
    )
  }
}
