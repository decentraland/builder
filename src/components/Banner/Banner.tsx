import * as React from 'react'
import { Close } from 'decentraland-ui'

import { Props, State, LocalStorageState } from './Banner.types'
import './Banner.css'

const MAX_SAVED_BANNERS = 2
const STORAGE_KEY = 'dcl-banner-storage'

export default class Banner extends React.PureComponent<Props, State> {
  static defaultProps = {
    isClosable: false,
    onClose: () => {
      /* noop */
    }
  }

  state = {
    isClosed: false
  }

  componentWillMount() {
    const savedState = localStorage.getItem(STORAGE_KEY)
    const { name } = this.props
    if (savedState && name) {
      const parsed: LocalStorageState = JSON.parse(savedState)
      if (parsed.includes(name)) {
        this.setState({ isClosed: true })
      }
    }
  }

  handleClose = () => {
    const { name, onClose } = this.props
    this.setState({ isClosed: true })

    if (name) {
      try {
        const savedState = localStorage.getItem(STORAGE_KEY)
        const parsed: LocalStorageState = savedState ? JSON.parse(savedState) : []

        if (parsed.length >= MAX_SAVED_BANNERS) {
          parsed.shift()
        }

        parsed.push(name)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      } catch (e) {
        // swallow
      }
    }

    onClose()
  }

  render() {
    const { isClosable, className, children } = this.props
    const { isClosed } = this.state
    let classes = 'Banner'

    if (isClosed) return null

    if (className) {
      classes += ` ${className}`
    }

    return (
      <div className={classes}>
        <span>{children}</span>
        {isClosable && <Close onClick={this.handleClose} small />}
      </div>
    )
  }
}
