import * as React from 'react'
import { Hero, Header, Button } from 'decentraland-ui'

import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import './HomePageHero.css'

export default class HomePageHero extends React.PureComponent {
  handleStart = () => {
    window.location.href = '#template-cards'
  }

  render() {
    return (
      <Hero height={472} className="HomePageHero">
        <div className="container">
          <div className="background">
            <div className="message">
              <Header size="huge">{t('home_page.title')}</Header>
              <div className="subtitle">
                <T
                  id="home_page.subtitle"
                  values={{
                    mana: <span className="highlight">{t('contest.mana')}</span>,
                    land: <span className="highlight">{t('contest.land')}</span>,
                    usd: <span className="highlight">{t('contest.usd')}</span>,
                    mana_per_scene: <span className="highlight">{t('contest.mana_per_scene')}</span>
                  }}
                />
              </div>
              <Button primary onClick={this.handleStart}>
                Start Building
              </Button>
            </div>
          </div>
        </div>
      </Hero>
    )
  }
}
