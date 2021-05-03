import * as React from 'react'
import { Dropdown, DropdownProps, Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props, State } from './MultiSelect.types'
import './MultiSelect.css'

export default class MultiSelect<T extends string> extends React.PureComponent<Props<T>, State<T>> {
  static defaultProps = {
    disabled: false
  }

  state: State<T> = {
    value: this.props.value
  }

  componentWillReceiveProps(newProps: Props<T>) {
    const { itemId, value } = newProps
    if (itemId !== this.props.itemId || value !== this.state.value) {
      this.setState({ value })
    }
  }

  handleChange = (_event: React.SyntheticEvent<HTMLElement, Event>, props: DropdownProps) => {
    const { onChange } = this.props
    const { value } = this.state
    if (!value.includes(props.value as T)) {
      const newValue = [...this.state.value, props.value as T]
      this.setState({ value: newValue })
      onChange(newValue)
    }
  }

  handleRemove = (value: T) => {
    const { onChange } = this.props
    const newValue = this.state.value.filter(_value => _value !== value)
    this.setState({ value: newValue })
    onChange(newValue)
  }

  renderTrigger() {
    const { label, info, options } = this.props
    const { value } = this.state
    const labels = options.reduce((obj, option) => {
      obj[option.value] = option.text
      return obj
    }, {} as Record<T, string>)

    return (
      <>
        <div className="label">
          {label}
          {info ? (
            <Popup className="info-popup" content={info} position="top center" trigger={<i className="info" />} on="hover" inverted />
          ) : null}
        </div>
        <div className="values">
          {value.length > 0 ? (
            value.map(value => (
              <div className="value" key={value}>
                {labels[value]}
                <div
                  className="remove"
                  onClick={event => {
                    this.handleRemove(value)
                    event.stopPropagation()
                  }}
                />
              </div>
            ))
          ) : (
            <div className="placeholder">{t('item_editor.right_panel.select_placeholder')}</div>
          )}
        </div>
        <div className="handle" />
      </>
    )
  }

  render() {
    const { options, disabled } = this.props
    const { value } = this.state
    return (
      <Dropdown
        className={`MultiSelect ${value.length > 0 ? '' : 'blank'}`.trim()}
        trigger={this.renderTrigger()}
        inline
        multiple
        direction="right"
        value={value}
        scrolling={false}
        options={options.filter(option => !value.includes(option.value))}
        disabled={disabled}
        onChange={this.handleChange}
      />
    )
  }
}
