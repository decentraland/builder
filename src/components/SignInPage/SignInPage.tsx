import React from 'react'
import { Page } from 'decentraland-ui'
import { default as SignIn } from 'decentraland-dapps/dist/containers/SignInPage'
import { ProviderType } from '@dcl/schemas'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import { redirectToAuthDapp } from 'routing/locations'
import { Props } from './SignInPage.types'

export default class SignInPage extends React.PureComponent<Props> {
  handleOnConnect = (providerType: ProviderType) => {
    this.props.onConnect(providerType)
  }

  handleRedirectToAuthDapp = () => {
    if (!this.props.isConnected && !this.props.isConnecting) {
      const params = new URLSearchParams(window.location.search)
      const basename = /^decentraland.(zone|org|today)$/.test(window.location.host) ? '/builder' : ''
      redirectToAuthDapp(`${basename}${params.get('redirectTo') || '/'}`)
    }
  }

  render() {
    const { isConnected } = this.props
    return (
      <>
        <Navbar />
        <Page>
          <SignIn onConnect={this.handleRedirectToAuthDapp} isConnected={isConnected} handleLoginConnect={this.handleOnConnect} />
        </Page>
        <Footer />
      </>
    )
  }
}
