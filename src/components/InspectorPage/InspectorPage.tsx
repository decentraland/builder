/* eslint-disable no-debugger */
import * as React from 'react'
import { Loader } from 'decentraland-ui'
import { config } from 'config'
import SignInRequired from 'components/SignInRequired'
import TopBar from './TopBar'
import { Props, State } from './InspectorPage.types'
import './InspectorPage.css'

const PUBLIC_URL = process.env.PUBLIC_URL

export default class InspectorPage extends React.PureComponent<Props, State> {
  state: State = {
    isLoaded: false
  }

  componentDidMount() {
    const { onOpen } = this.props
    onOpen()
  }

  refIframe = (iframe: HTMLIFrameElement | null) => {
    const { onConnect } = this.props
    if (iframe) {
      iframe.onload = () => {
        this.setState({ isLoaded: true })
      }
      onConnect(iframe.id)
    }
  }

  render() {
    const { scene, project, isLoggedIn, isReloading, isSmartItemsEnabled, address = '' } = this.props

    if (!isLoggedIn) {
      return <SignInRequired />
    }

    let htmlUrl = `${PUBLIC_URL}/inspector-index.html`
    let binIndexJsUrl = `${PUBLIC_URL}/bin/index.js`

    // use the local @dcl/inspector running on your machine
    if (process.env.REACT_APP_INSPECTOR_PORT) {
      htmlUrl = `http://localhost:${process.env.REACT_APP_INSPECTOR_PORT}`
      binIndexJsUrl = `${htmlUrl}/bin/index.js`
    }

    let queryParams = `?dataLayerRpcParentUrl=${window.location.origin}`

    // use the local bin/index.js being watched and served on your machine
    if (process.env.REACT_APP_BIN_INDEX_JS_DEV_PORT && process.env.REACT_APP_BIN_INDEX_JS_DEV_PATH) {
      const b64 = btoa(process.env.REACT_APP_BIN_INDEX_JS_DEV_PATH)
      binIndexJsUrl = `http://localhost:${process.env.REACT_APP_BIN_INDEX_JS_DEV_PORT}/content/contents/b64-${b64}`
    }

    queryParams = queryParams.concat(`&binIndexJsUrl=${binIndexJsUrl}`)

    queryParams = queryParams.concat(`&contentUrl=${config.get('INSPECTOR_CONTENT_URL')}`)

    queryParams = queryParams.concat(`&segmentKey=${config.get('INSPECTOR_SEGMENT_API_KEY')}`)

    queryParams = queryParams.concat(`&segmentAppId=${config.get('INSPECTOR_SEGMENT_APP_ID')}`)

    queryParams = queryParams.concat(`&segmentUserId=${address}`)

    if (project?.id) {
      queryParams = queryParams.concat(`&projectId=${project.id}`)
    }

    if (!isSmartItemsEnabled) {
      queryParams = queryParams.concat('&disableSmartItems')
    }

    return (
      <div className="InspectorPage">
        {(!this.state.isLoaded || isReloading) && <Loader active />}
        {scene && !isReloading && (
          <>
            <TopBar />
            <iframe ref={this.refIframe} title="inspector" id="inspector" src={`${htmlUrl}${queryParams}`} />
          </>
        )}
      </div>
    )
  }
}
