import * as React from 'react'
import { Props, State } from './Collapsable.types'
import './Collapsable.css'

export default class Collapsable extends React.PureComponent<Props, State> {
  state: State = {
    isCollapsed: false
  }

  handleToggle = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed })
  }

  render() {
    const { label, children } = this.props
    const { isCollapsed } = this.state

    const isOpen = !isCollapsed

    return (
      <div className={`Collapsable ${isOpen ? 'is-open' : ''}`.trim()}>
        <div className="header" onClick={this.handleToggle}>
          <div className="label">{label}</div>
          <div className="handle" />
        </div>
        <div className="content">{isOpen ? children : null}</div>
      </div>
    )
  }
}
