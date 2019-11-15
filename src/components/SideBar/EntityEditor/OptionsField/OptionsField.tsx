import * as React from 'react'
import { SelectField, DropdownProps } from 'decentraland-ui'
import { Props } from './OptionsField.types'
import './OptionsField.css'

export default class OptionsField extends React.PureComponent<Props> {
  handleChange = (_: any, props: DropdownProps) => {
    const { onChange } = this.props
    const value = props.value as string
    onChange(value)
  }

  renderTrigger = () => {
    const { value, options } = this.props
    const option = options.find(opt => opt.value === value)

    if (!option) return null

    return (
      <span className="trigger">
        <span title={option.label} className="text">
          {option.label}
        </span>
      </span>
    )
  }

  render() {
    const { id, label, options, className = '', value } = this.props
    let selectOptions = options.map(opt => ({ key: opt.value, text: opt.label, value: opt.value }))

    return (
      <div className={`OptionsField ParameterField ${className}`}>
        {label && (
          <label htmlFor={id} className="label">
            {label}
          </label>
        )}
        <SelectField
          id={id}
          value={value}
          options={selectOptions}
          onChange={this.handleChange}
          trigger={this.renderTrigger()}
          search={false}
        />
      </div>
    )
  }
}
