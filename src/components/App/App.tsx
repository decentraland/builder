import * as React from 'react'

import { Navbar, Page, Footer, Locale } from 'decentraland-ui'
import * as languages from 'modules/translation/languages'
import HomePageHero from 'components/HomePageHero'
import { Props } from './App.types'

export default class App extends React.PureComponent<Props> {
  render() {
    const { isHomePage, children } = this.props

    return (
      <>
        <Navbar activePage="builder" onSignIn={undefined} isFullscreen isOverlay={isHomePage} />
        {isHomePage && <HomePageHero />}
        <Page hasHero={isHomePage} heroHeight={472}>
          {children}
        </Page>
        <Footer locales={Object.keys(languages) as Locale[]} />
      </>
    )
  }
}
