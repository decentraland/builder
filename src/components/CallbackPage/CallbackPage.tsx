import * as React from 'react'
import { Loader, Page } from 'decentraland-ui'

import Navbar from 'components/Navbar'
import Footer from 'components/Footer'

export default class CallbackPage extends React.PureComponent {
  render() {
    return (
      <>
        <Navbar isFullscreen />
        <Page isFullscreen>
          <Loader active size="huge" />
        </Page>
        <Footer isFullscreen />
      </>
    )
  }
}
