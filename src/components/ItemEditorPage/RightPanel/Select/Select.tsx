import * as React from 'react'
import { Dropdown, DropdownProps } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props, State } from './Select.types'
import './Select.css'

export default class Select<T extends string> extends React.PureComponent<Props<T>, State<T>> {
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
    const { value, onChange } = this.props
    const newValue = props.value as T
    if (newValue !== value) {
      this.setState({ value: newValue })
      onChange(newValue)
    }
  }

  renderTrigger() {
    const { label, options } = this.props
    const { value } = this.state
    const selected = options.find(option => option.value === value)

    return (
      <>
        <div className="label">{label}</div>
        <div className="value">{selected ? selected.text : t('item_editor.right_panel.select_placeholder')}</div>
        <div className="handle" />
      </>
    )
  }

  render() {
    const { options, disabled } = this.props
    const { value } = this.state
    return (
      <Dropdown
        className={`Select ${value ? '' : 'blank'}`.trim()}
        trigger={this.renderTrigger()}
        inline
        direction="right"
        scrolling={options.length > 4}
        value={value || undefined}
        options={options}
        disabled={disabled}
        onChange={this.handleChange}
      />
    )
  }
}
