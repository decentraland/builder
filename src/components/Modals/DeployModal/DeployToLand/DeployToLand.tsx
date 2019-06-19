import * as React from 'react'
import { Button, Loader, Atlas } from 'decentraland-ui'
import { T } from 'decentraland-dapps/dist/modules/translation/utils'
import './DeployToLand.css'

import { Props, State } from './DeployToLand.types'

export default class DeployToLand extends React.PureComponent<Props, State> {
  state = {
    placement: null,
    hasError: false
  }

  handleConnect = () => {
    this.props.onConnect!()
    this.props.onRecord()
  }

  renderConnectForm = () => {
    const { hasError, isConnecting } = this.props
    let errorClasses = 'error'

    if (hasError) {
      errorClasses += ' visible'
    }

    return (
      <div className="DeployToLand">
        <Button className="connect" primary onClick={this.handleConnect} disabled={isConnecting}>
          {isConnecting ? <T id="@dapps.sign_in.connecting" /> : <T id="@dapps.sign_in.connect" />}
        </Button>

        <p className={errorClasses}>
          <T id="@dapps.sign_in.error" />
        </p>
      </div>
    )
  }

  renderProgress = () => {
    return <>progress</>
  }

  renderMap = () => {
    return <Atlas />
  }

  renderConfirmation = () => {
    return <>condirmation</>
  }

  render() {
    const { isConnected, isRecording, isUploadingAssets, media } = this.props
    const { placement } = this.state

    if (!isConnected) return this.renderConnectForm()

    if (isConnected && (isRecording || isUploadingAssets)) return this.renderProgress()

    if (isConnected && media && !placement) return this.renderMap()

    if (isConnected && media && placement && !isUploadingAssets) return this.renderConfirmation()

    return <Loader size="big" />
  }
}
