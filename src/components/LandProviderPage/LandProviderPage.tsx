import * as React from 'react'
import { Page, Loader, Center } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import LandProvider from 'components/LandProvider'
import { Props } from './LandProviderPage.types'

export default class LandProviderPage extends React.PureComponent<Props> {
  renderLoading() {
    return (
      <Center>
        <Loader active size="large" />
      </Center>
    )
  }

  renderNotFound() {
    return (
      <Center>
        <span className="secondary-text">{t('global.not_found')}&hellip;</span>
      </Center>
    )
  }

  render() {
    const { className, children } = this.props
    const classes = ['LandProviderPage']
    if (className) {
      classes.push(className)
    }
    return (
      <>
        <Navbar />
        <Page className={classes.join(' ')}>
          <LandProvider>
            {(id, land, projects, isLoading) => (
              <>
                {isLoading ? this.renderLoading() : null}
                {!isLoading && !(id && land) ? this.renderNotFound() : null}
                {id && land ? children(land, projects) : null}
              </>
            )}
          </LandProvider>
        </Page>
        <Footer />
      </>
    )
  }
}
