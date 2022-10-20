import * as React from 'react'
import { BACKSPACE_KEY_CODE, COMMA_KEY_CODE, ENTER_KEY_CODE, WHITE_SPACE_KEY_CODE } from 'modules/keyboard/types'
import { Props, State } from './Tags.types'
import './Tags.css'

export default class Tags extends React.PureComponent<Props, State> {
  static defaultProps = {
    isDisabled: false
  }

  state: State = {
    draft: '',
    value: this.props.value
  }

  componentWillReceiveProps(newProps: Props) {
    const { itemId, value } = newProps
    if (itemId !== this.props.itemId || value !== this.state.value) {
      this.setState({ value })
    }
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ draft: event.target.value })
  }

  handleAdd = () => {
    const { onChange } = this.props
    const { draft, value } = this.state
    const add = draft.trim()
    if (add !== '') {
      if (!value.includes(add)) {
        const newValue = [...value, add]
        this.setState({ value: newValue, draft: '' })
        onChange(newValue)
      } else {
        this.setState({ draft: '' })
      }
    }
  }

  handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === '#') {
      // To avoid misunderstandings, we're forbidding the '#' usage as part of the tags
      event.preventDefault()
      return
    } else if (event.keyCode === WHITE_SPACE_KEY_CODE || event.keyCode === ENTER_KEY_CODE || event.keyCode === COMMA_KEY_CODE) {
      this.handleAdd()
    } else if (event.keyCode === BACKSPACE_KEY_CODE || event.keyCode === ENTER_KEY_CODE) {
      const { draft, value } = this.state
      const last = value[value.length - 1]
      if (last && draft === '') {
        this.handleRemove(last)
      }
    }
  }

  handleRemove = (value: string) => {
    const { onChange } = this.props
    const newValue = this.state.value.filter(_value => _value !== value)
    this.setState({ value: newValue })
    onChange(newValue)
  }

  render() {
    const { isDisabled } = this.props
    const { draft, value } = this.state
    return (
      <div className={`Tags ${value.length > 0 ? '' : 'blank'} ${isDisabled ? 'is-disabled' : ''}`.trim()}>
        <div className="values">
          {value.map(value => (
            <div className="value" key={value}>
              {value}
              <div
                className="remove"
                onClick={event => {
                  this.handleRemove(value)
                  event.stopPropagation()
                }}
              />
            </div>
          ))}
          <input value={draft} onChange={this.handleChange} onKeyDown={this.handleKeyDown} onBlur={this.handleAdd} disabled={isDisabled} />
        </div>
      </div>
    )
  }
}
