import * as React from 'react'
import { Popup } from 'decentraland-ui'
import Icon from 'components/Icon'
import { Props } from './Control.types'

export default class Control extends React.PureComponent<Props> {
  render() {
    const { content, icon, onClick } = this.props
    return (
      <Popup
        className="control-tooltip"
        content={content}
        position="top center"
        trigger={
          <div className={`control ${icon}`} onClick={onClick}>
            <Icon name={icon} />
          </div>
        }
        on="hover"
        inverted
      />
    )
  }
}
