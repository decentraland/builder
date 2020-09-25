import * as React from 'react'
import { Props, State } from './Tags.types'
import './Tags.css'

const WHITE_SPACE_KEY_CODE = 32
const ENTER_KEY_CODE = 13
const COMMA_KEY_CODE = 118
const BACKSPACE_KEY_CODE = 8
const DELETE_KEY_CODE = 46

export default class Tags extends React.PureComponent<Props, State> {
  state: State = {
    draft: '',
    value: this.props.value
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.itemId !== this.props.itemId) {
      this.setState({ value: newProps.value })
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
    if (event.keyCode === WHITE_SPACE_KEY_CODE || event.keyCode === ENTER_KEY_CODE || event.keyCode === COMMA_KEY_CODE) {
      this.handleAdd()
    } else if (event.keyCode === BACKSPACE_KEY_CODE || event.keyCode === DELETE_KEY_CODE) {
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
    const { draft, value } = this.state
    return (
      <div className={`Tags ${value.length > 0 ? '' : 'blank'}`.trim()}>
        <div className="values">
          {value.map(value => (
            <div className="value">
              {value}
              <div
                className="remove"
                onClick={event => {
                  this.handleRemove(value)
                  event.stopPropagation()
                  event.nativeEvent.stopPropagation()
                  event.preventDefault()
                  event.nativeEvent.preventDefault()
                }}
              />
            </div>
          ))}
        </div>
        <input
          value={draft}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          onBlur={this.handleAdd}
          placeholder={value.length === 0 ? 'Write something...' : undefined}
        />
      </div>
    )
  }
}
