import * as React from 'react'
import { Hero, Button } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props } from './HomePageHero.types'
import './HomePageHero.css'

export default class HomePageHero extends React.PureComponent<Props> {
  handleStart = () => {
    window.location.href = '#template-cards'
  }

  handleWatchVideo = () => {
    this.props.onOpenModal('VideoModal')
  }

  render() {
    return (
      <Hero height={472} className="HomePageHero">
        <Hero.Header>{t('home_page.title')}</Hero.Header>
        <Hero.Description>
          <span className="description">
            <T
              id="home_page.subtitle"
              values={{
                mana: <span className="highlight">{t('contest.mana')}</span>,
                land: <span className="highlight">{t('contest.land')}</span>,
                usd: <span className="highlight">{t('contest.usd')}</span>,
                mana_per_scene: <span className="highlight">{t('contest.mana_per_scene')}</span>
              }}
            />
          </span>
        </Hero.Description>
        <Hero.Actions>
          <Button primary onClick={this.handleStart}>
            Start Building
          </Button>
          <Button className="hollow" onClick={this.handleWatchVideo}>
            Watch Tutorial
          </Button>
        </Hero.Actions>

        <Hero.Content>
          <div className="background" />
        </Hero.Content>
      </Hero>
    )
  }
}
