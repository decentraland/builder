import * as React from 'react'
import { Icon } from 'decentraland-ui'
import { Props, State } from './Drawer.types'
import './Drawer.css'

export default class Drawer extends React.PureComponent<Props, State> {
  state = {
    isOpen: true
  }

  handleClick = () => {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  render() {
    const { label, children, hasLabel } = this.props
    const { isOpen } = this.state

    return (
      <div className="Drawer">
        {hasLabel ? (
          <div className="heading" onClick={this.handleClick}>
            <span className="label">{label}</span>
            <div>
              <Icon name={isOpen ? 'angle up' : 'angle down'} />
            </div>
          </div>
        ) : null}
        <div className="body">{isOpen ? children : null}</div>
      </div>
    )
  }
}
