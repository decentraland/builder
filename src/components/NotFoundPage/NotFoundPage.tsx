import * as React from 'react'
import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'

import { Props } from './NotFoundPage.types'
import './NotFoundPage.css'

export default class NotFoundPage extends React.PureComponent<Props> {
  handleOnClick = () => {
    this.props.onNavigate(locations.root())
  }

  render() {
    return (
      <div className="NotFoundPage">
        <div className="overlay" />
        <h1 className="title">{t('notfoundpage.title')}</h1>
        <p className="subtitle">{t('notfoundpage.subtitle')}</p>
        <Button className="back" onClick={this.handleOnClick} primary>
          {t('notfoundpage.back')}
        </Button>
      </div>
    )
  }
}
