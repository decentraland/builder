import * as React from 'react'
import classNames from 'classnames'
import { Popup } from 'decentraland-ui'
import { InfoIcon } from 'components/InfoIcon'
import { Props } from './Info.types'
import './Info.css'

export default class Info extends React.PureComponent<Props> {
  render() {
    const { className, content = '' } = this.props
    return (
      <Popup
        className="info-popup"
        content={content}
        position="top center"
        trigger={<InfoIcon className={classNames(className, 'infoIcon')} />}
        on="hover"
        inverted
      />
    )
  }
}
