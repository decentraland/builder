import * as React from 'react'

import { Props } from './Notice.types'
import Icon from 'components/Icon'
import './Notice.css'

export default class Notice extends React.PureComponent<Props> {
  state = {
    isNoticeClosed: false
  }

  constructor(props: Props) {
    super(props)
    const { storageKey } = props

    this.state = {
      isNoticeClosed: localStorage.getItem(storageKey) !== null
    }
  }

  handleCloseNotice = () => {
    const { storageKey } = this.props

    this.setState({ isNoticeClosed: true })
    localStorage.setItem(storageKey, '1')
  }

  render() {
    const { children } = this.props
    const { isNoticeClosed } = this.state

    if (isNoticeClosed) {
      return null
    }

    return (
      <div className="Notice">
        <div className="text">{children}</div>
        <Icon name="close" onClick={this.handleCloseNotice} />
      </div>
    )
  }
}
