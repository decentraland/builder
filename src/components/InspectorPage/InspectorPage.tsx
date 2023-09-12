/* eslint-disable no-debugger */
import * as React from 'react'
import { Loader } from 'decentraland-ui'
import SignInRequired from 'components/SignInRequired'

import { Props, State } from './InspectorPage.types'
import './InspectorPage.css'
import TopBar from './TopBar'

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
    const { scene, isLoggedIn, isReloading, isSmartItemsEnabled } = this.props

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

    // use the local bin/index.js being watched an served on your machine
    if (process.env.REACT_APP_BIN_INDEX_JS_DEV_PORT && process.env.REACT_APP_BIN_INDEX_JS_DEV_PATH) {
      const b64 = btoa(process.env.REACT_APP_BIN_INDEX_JS_DEV_PATH)
      binIndexJsUrl = `http://localhost:${process.env.REACT_APP_BIN_INDEX_JS_DEV_PORT}/content/contents/b64-${b64}`
    }

    queryParams = queryParams.concat(`&binIndexJsUrl=${binIndexJsUrl}`)

    if (process.env.REACT_APP_CATALOG_URL) {
      queryParams = queryParams.concat(`&catalogUrl=${process.env.REACT_APP_CATALOG_URL}`)
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
