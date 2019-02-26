import * as React from 'react'
import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { env } from 'decentraland-commons'
import { IntercomWidget } from 'decentraland-dapps/dist/components/Intercom/IntercomWidget'

import { Props } from './ErrorPage.types'
import './ErrorPage.css'

const APP_ID = env.get('REACT_APP_INTERCOM_APP_ID', '')
const widget = new IntercomWidget(APP_ID)

export default class ErrorPage extends React.PureComponent<Props> {
  handleOnClick = () => {
    const { stackTrace } = this.props
    const lines = stackTrace.split('\n')
    widget.showNewMessage(`Hey! I just ran into this error using the Builder:\n${lines[0] + lines[1]}`)
  }

  handleSelectText = (el: React.MouseEvent<HTMLTextAreaElement>) => {
    el.currentTarget.focus()
    el.currentTarget.select()
  }

  render() {
    const { stackTrace } = this.props
    return (
      <div className="ErrorPage">
        <div className="overlay" />
        <h1 className="title">{t('errorpage.title')}</h1>
        <p className="subtitle">{t('errorpage.subtitle')}</p>

        <textarea className="trace" cols={70} rows={10} value={stackTrace} onClick={this.handleSelectText} readOnly />

        <Button className="back" onClick={this.handleOnClick} primary>
          {t('errorpage.support')}
        </Button>
        <span className="suggestion">
          {t('errorpage.or')} <a href=".">{t('errorpage.reload')}</a>
        </span>
      </div>
    )
  }
}
