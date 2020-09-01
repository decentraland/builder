import * as React from 'react'
import { Page, Loader, Center } from 'decentraland-ui'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import NotFound from 'components/NotFound'
import LandProvider from 'components/LandProvider'
import { Props } from './LandProviderPage.types'
import './LandProviderPage.css'

export default class LandProviderPage extends React.PureComponent<Props> {
  renderLoading() {
    return (
      <Center>
        <Loader active size="large" />
      </Center>
    )
  }

  renderNotFound() {
    return <NotFound />
  }

  render() {
    const { className, children } = this.props
    const classes = ['LandProviderPage']
    if (className) {
      classes.push(className)
    }
    return (
      <>
        <Navbar isFullscreen />
        <Page className={classes.join(' ')}>
          <LandProvider>
            {(id, land, deployments, isLoading) => (
              <>
                {isLoading ? this.renderLoading() : null}
                {!isLoading && !(id && land) ? this.renderNotFound() : null}
                {id && land ? children(land, deployments) : null}
              </>
            )}
          </LandProvider>
        </Page>
        <Footer />
      </>
    )
  }
}
