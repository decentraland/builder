import * as React from 'react'

import { Button, Popup } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { getExceededMetrics } from 'modules/scene/utils'
import { DeploymentStatus } from 'modules/deployment/types'
import { DeployModalView, DeployModalMetadata } from 'components/Modals/DeployModal/DeployModal.types'
import { Props, DefaultProps } from './DeployButton.types'
import './DeployButton.css'

export default class DeployButton extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    onClick: () => {
      /* noop */
    }
  }

  handleClearDeployment = () => {
    const { project, onOpenModal } = this.props
    onOpenModal('DeployModal', { view: DeployModalView.CLEAR_DEPLOYMENT, projectId: project.id } as DeployModalMetadata)
  }

  handleClick = () => {
    const { project, onOpenModal } = this.props
    const canUpdate = this.isUpdate()

    onOpenModal('DeployModal', {
      view: canUpdate ? DeployModalView.DEPLOY_TO_LAND : DeployModalView.NONE,
      projectId: project.id
    } as DeployModalMetadata)
  }

  isUpdate = () => {
    const { deploymentStatus } = this.props
    return deploymentStatus !== DeploymentStatus.UNPUBLISHED
  }

  getExceededMetric = () => {
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
      return <T id="topbar.up_to_date" values={{ br: <br /> }} />
    }
    return null
  }

  render() {
    const { areEntitiesOutOfBoundaries, isLoading } = this.props
    const exceededMetric = this.getExceededMetric()
    const didExceedMetrics = exceededMetric !== '' || areEntitiesOutOfBoundaries
    const isButtonDisabled = isLoading || didExceedMetrics
    const isPopupDisabled = isLoading || !isButtonDisabled

    return (
      <span className="DeployButton tool">
        <Popup
          content={this.renderPopupContent()}
          position="bottom center"
          disabled={isPopupDisabled}
          trigger={
            <span>
              <Button primary size="mini" onClick={this.handleClick} disabled={isButtonDisabled}>
                {t('global.publish')}
              </Button>
            </span>
          }
          on="hover"
        />
      </span>
    )
  }
}
