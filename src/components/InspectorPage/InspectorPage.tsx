/* eslint-disable no-debugger */
import * as React from 'react'
import { Center, Loader } from 'decentraland-ui'

import { Props, State } from './InspectorPage.types'
import './InspectorPage.css'
import TopBar from './TopBar'
import NotFoundPage from 'components/NotFoundPage'

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
    const { scene, isLoggedIn, isInspectorEnabled } = this.props

    if (!isInspectorEnabled) {
      return <NotFoundPage />
    }

    if (!isLoggedIn) {
      return (
        <div className="InspectorPager">
          <Center>Sign In</Center>
        </div>
      )
    }

    return (
      <div className="InspectorPage">
        {!this.state.isLoaded && <Loader active />}
        {scene && (
          <>
            <TopBar />
            <iframe ref={this.refIframe} title="inspector" id="inspector" src={`/inspector-index.html?parent=${window.location.origin}`} />
          </>
        )}
      </div>
    )
  }
}
