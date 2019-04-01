import * as React from 'react'
import { Hero, Button } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props } from './HomePageHero.types'
import './HomePageHero.css'

export default class HomePageHero extends React.PureComponent<Props> {
  handleStart = () => {
    this.props.onStart()
  }

  handleWatchVideo = () => {
    this.props.onWatchVideo()
  }

  render() {
    return (
      <Hero height={472} className="HomePageHero">
        <Hero.Header>{t('home_page.title')}</Hero.Header>
        <Hero.Description>
          <span className="description">
            <T id="home_page.subtitle" />
          </span>
        </Hero.Description>
        <Hero.Actions>
          <Button primary onClick={this.handleStart}>
            {t('home_page.start')}
          </Button>
          <Button className="hollow" onClick={this.handleWatchVideo}>
            {t('global.learn_more')}
          </Button>
        </Hero.Actions>

        <Hero.Content>
          <div className="background" />
        </Hero.Content>
      </Hero>
    )
  }
}
