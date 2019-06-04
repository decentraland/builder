import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Icon, Input } from 'decentraland-ui'
import { debounce } from 'lib/debounce'

import { Props, State } from './SidebarSearch.types'

import './SidebarSearch.css'

const CTRL_KEY_CODE = 17
const COMMAND_KEY_CODE = 91
const Z_KEY_CODE = 90

export default class SidebarSearch extends React.PureComponent<Props, State> {
  state = {
    search: this.props.search
  }

  isCtrlDown = false

  handleSearchDebounced = debounce((value: string) => {
    this.props.onResetScroll()
    this.props.onSearch(value)
  }, 200)

  componentWillMount() {
    document.body.addEventListener('keydown', this.handleKeyDown)
    document.body.addEventListener('keyup', this.handleKeyUp)
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.handleKeyDown)
    document.body.removeEventListener('keyup', this.handleKeyUp)
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.search.length > 0 && nextProps.search.length === 0 && this.state.search.length > 0) {
      this.setState({ search: '' })
    }
  }

  handleKeyDown = (e: KeyboardEvent) => {
    // ctrl or command
    if (e.keyCode === CTRL_KEY_CODE || e.keyCode === COMMAND_KEY_CODE) {
      this.isCtrlDown = true
    }

    // z key
    if (this.isCtrlDown && e.keyCode === Z_KEY_CODE) {
      e.preventDefault() // prevent ctrl+z on the editor from changing the value of the search input
      return false
    }

    return true
  }

  handleKeyUp = (e: KeyboardEvent) => {
    // ctrl or command
    if (e.keyCode === CTRL_KEY_CODE || e.keyCode === COMMAND_KEY_CODE) {
      this.isCtrlDown = false
    }
  }

  handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ search: event.target.value })
    this.handleSearchDebounced(event.target.value)
  }

  handleCleanSearch = () => {
    this.setState({ search: '' })
    this.handleSearchDebounced('')
  }

  render() {
    const { search, isDisabled } = this.props
    let classes = 'SidebarSearch'
    if (isDisabled) {
      classes += ' disabled'
    }
    return (
      <div className={classes}>
        <Icon name="search" />
        <Input
          className="search-input"
          placeholder={t('itemdrawer.search')}
          icon={search.length > 0 ? { name: 'close', size: 'small', onClick: this.handleCleanSearch } : null}
          value={this.state.search}
          onChange={this.handleSearch}
          disabled={isDisabled}
        />
      </div>
    )
  }
}
