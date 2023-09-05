/* eslint-disable no-debugger */
import * as React from 'react'
import { Loader } from 'decentraland-ui'
import NotFoundPage from 'components/NotFoundPage'
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
    const { scene, isLoggedIn, isInspectorEnabled, isReloading } = this.props

    if (!isInspectorEnabled) {
      return <NotFoundPage />
    }

    if (!isLoggedIn) {
      return <SignInRequired />
    }

    return (
      <div className="InspectorPage">
        {(!this.state.isLoaded || isReloading) && <Loader active />}
        {scene && !isReloading && (
          <>
            <TopBar />
            <iframe
              ref={this.refIframe}
              title="inspector"
              id="inspector"
              src={`${
                process.env.REACT_APP_INSPECTOR_PORT
                  ? `http://localhost:${process.env.REACT_APP_INSPECTOR_PORT}`
                  : `${PUBLIC_URL}/inspector-index.html`
              }?parent=${window.location.origin}`}
            />
          </>
        )}
      </div>
    )
  }
}
